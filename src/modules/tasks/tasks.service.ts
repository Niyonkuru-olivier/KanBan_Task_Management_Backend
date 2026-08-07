import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Task, ColumnEntity, User, ActivityLog, Board } from '../../entities';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async logActivity(action: string, taskId: number | null, userId: number) {
    let workspaceId: number | null = null;
    let boardId: number | null = null;
    let columnId: number | null = null;

    if (taskId) {
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: { column: { board: true } },
      });
      if (task?.column) {
        columnId = task.columnId;
        if (task.column.board) {
          boardId = task.column.boardId;
          workspaceId = task.column.board.workspaceId;
        }
      }
    }

    const log = this.activityLogRepository.create({
      action,
      taskId,
      userId,
      workspaceId,
      boardId,
      columnId,
    });
    await this.activityLogRepository.save(log);
  }

  private async checkColumnAccess(columnId: number, user: any): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: { board: { workspace: true } },
    });
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    await this.workspacesService.checkWorkspaceAccess(column.board.workspaceId, user, false);
    return column;
  }

  private async checkTaskAccess(task: Task, user: any) {
    if (task.column?.board?.workspaceId) {
      await this.workspacesService.checkWorkspaceAccess(task.column.board.workspaceId, user, false);
    } else {
      if (user.role !== 'admin' && task.assigneeId !== user.id) {
         throw new ForbiddenException('You do not have access to this task');
      }
    }
  }

  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    const column = await this.checkColumnAccess(createTaskDto.columnId, user);

    if (createTaskDto.assigneeId) {
      const assignee = await this.userRepository.findOne({
        where: { id: createTaskDto.assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException(`User with ID ${createTaskDto.assigneeId} not found`);
      }
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      columnId: createTaskDto.columnId,
      assigneeId: createTaskDto.assigneeId || null,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      priority: createTaskDto.priority || 'Medium',
      position: createTaskDto.position || 0,
    });

    const savedTask = await this.taskRepository.save(task);

    await this.logActivity(
      `Created task "${savedTask.title}" in column "${column.title}"`,
      savedTask.id,
      user.id,
    );

    return this.findOne(savedTask.id, user);
  }

  async findAll(filterDto: TaskFilterDto, user: any): Promise<PaginatedResult<Task>> {
    const { page = 1, limit = 10, columnId, boardId, assigneeId, search } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.column', 'column')
      .leftJoinAndSelect('column.board', 'board')
      .leftJoinAndSelect('board.workspace', 'workspace')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.comments', 'comments');

    if (user.role !== 'admin') {
      // Check if user is a member of the workspace or the assignee of the task
      queryBuilder.leftJoin('workspace_members', 'wm', 'wm.workspace_id = workspace.id AND wm.user_id = :userId', { userId: user.id });
      queryBuilder.andWhere(
        '(wm.id IS NOT NULL OR workspace.owner_id = :userId OR task.assignee_id = :userId)',
        { userId: user.id },
      );
    }

    if (columnId) {
      queryBuilder.andWhere('task.column_id = :columnId', { columnId });
    }

    if (boardId) {
      queryBuilder.andWhere('column.board_id = :boardId', { boardId });
    }

    if (assigneeId) {
      queryBuilder.andWhere('task.assignee_id = :assigneeId', { assigneeId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('task.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    data.forEach((t) => {
      if (t.assignee) {
        delete (t.assignee as any).passwordHash;
      }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, user: any): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { column: { board: { workspace: true } }, assignee: true, comments: { author: true }, activityLogs: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.checkTaskAccess(task, user);

    if (task.assignee) {
      delete (task.assignee as any).passwordHash;
    }

    if (task.comments) {
      task.comments.forEach((c) => {
        if (c.author) {
          delete (c.author as any).passwordHash;
        }
      });
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: any): Promise<Task> {
    const task = await this.findOne(id, user);

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.columnId !== undefined && updateTaskDto.columnId !== task.columnId) {
      const targetColumn = await this.checkColumnAccess(updateTaskDto.columnId, user);
      
      const oldColName = task.column?.title || 'previous column';
      task.columnId = updateTaskDto.columnId;

      await this.logActivity(
        `Moved task "${task.title}" from "${oldColName}" to "${targetColumn.title}"`,
        task.id,
        user.id,
      );
    }

    if (updateTaskDto.assigneeId !== undefined) {
      task.assigneeId = updateTaskDto.assigneeId;
    }

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }

    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority;
    }

    if (updateTaskDto.position !== undefined) {
      task.position = updateTaskDto.position;
    }

    const updatedTask = await this.taskRepository.save(task);

    await this.logActivity(`Updated task details for "${updatedTask.title}"`, task.id, user.id);

    return this.findOne(updatedTask.id, user);
  }

  async move(id: number, moveTaskDto: MoveTaskDto, user: any): Promise<Task> {
    const task = await this.findOne(id, user);
    const targetColumn = await this.checkColumnAccess(moveTaskDto.targetColumnId, user);

    const sourceColName = task.column?.title || 'Unknown Column';
    task.columnId = moveTaskDto.targetColumnId;

    const savedTask = await this.taskRepository.save(task);

    await this.logActivity(
      `Moved task "${task.title}" from "${sourceColName}" to "${targetColumn.title}"`,
      task.id,
      user.id,
    );

    return this.findOne(savedTask.id, user);
  }

  async assign(id: number, assignTaskDto: AssignTaskDto, user: any): Promise<Task> {
    const task = await this.findOne(id, user);

    if (assignTaskDto.assigneeId !== undefined && assignTaskDto.assigneeId !== null) {
      const assignee = await this.userRepository.findOne({
        where: { id: assignTaskDto.assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException(`User with ID ${assignTaskDto.assigneeId} not found`);
      }
      task.assigneeId = assignTaskDto.assigneeId;
      await this.logActivity(
        `Assigned task "${task.title}" to user "${assignee.name}"`,
        task.id,
        user.id,
      );
    } else {
      task.assigneeId = null;
      await this.logActivity(`Unassigned task "${task.title}"`, task.id, user.id);
    }

    const savedTask = await this.taskRepository.save(task);
    return this.findOne(savedTask.id, user);
  }

  async remove(id: number, user: any): Promise<void> {
    const task = await this.findOne(id, user);
    await this.logActivity(`Deleted task "${task.title}"`, null, user.id);
    await this.taskRepository.remove(task);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Task, ColumnEntity, User, ActivityLog } from '../../entities';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

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
  ) {}

  private async logActivity(action: string, taskId: number | null, userId: number) {
    const log = this.activityLogRepository.create({
      action,
      taskId,
      userId,
    });
    await this.activityLogRepository.save(log);
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const column = await this.columnRepository.findOne({
      where: { id: createTaskDto.columnId },
    });
    if (!column) {
      throw new NotFoundException(`Column with ID ${createTaskDto.columnId} not found`);
    }

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
    });

    const savedTask = await this.taskRepository.save(task);

    await this.logActivity(
      `Created task "${savedTask.title}" in column "${column.title}"`,
      savedTask.id,
      userId,
    );

    return this.findOne(savedTask.id);
  }

  async findAll(filterDto: TaskFilterDto): Promise<PaginatedResult<Task>> {
    const { page = 1, limit = 10, columnId, boardId, assigneeId, search } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.column', 'column')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.comments', 'comments');

    if (columnId) {
      queryBuilder.andWhere('task.columnId = :columnId', { columnId });
    }

    if (boardId) {
      queryBuilder.andWhere('column.boardId = :boardId', { boardId });
    }

    if (assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('task.createdAt', 'DESC')
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

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      //relations: ['column', 'column.board', 'assignee', 'comments', 'comments.author', 'activityLogs'],
    relations: { column: { board: true }, assignee: true, comments: { author: true }, activityLogs: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

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

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.columnId !== undefined && updateTaskDto.columnId !== task.columnId) {
      const targetColumn = await this.columnRepository.findOne({
        where: { id: updateTaskDto.columnId },
      });
      if (!targetColumn) {
        throw new NotFoundException(`Target column ${updateTaskDto.columnId} not found`);
      }
      const oldColName = task.column?.title || 'previous column';
      task.columnId = updateTaskDto.columnId;

      await this.logActivity(
        `Moved task "${task.title}" from "${oldColName}" to "${targetColumn.title}"`,
        task.id,
        userId,
      );
    }

    if (updateTaskDto.assigneeId !== undefined) {
      task.assigneeId = updateTaskDto.assigneeId;
    }

    const updatedTask = await this.taskRepository.save(task);

    await this.logActivity(`Updated task details for "${updatedTask.title}"`, task.id, userId);

    return this.findOne(updatedTask.id);
  }

  async move(id: number, moveTaskDto: MoveTaskDto, userId: number): Promise<Task> {
    const task = await this.findOne(id);
    const targetColumn = await this.columnRepository.findOne({
      where: { id: moveTaskDto.targetColumnId },
    });

    if (!targetColumn) {
      throw new NotFoundException(`Column with ID ${moveTaskDto.targetColumnId} not found`);
    }

    const sourceColName = task.column?.title || 'Unknown Column';
    task.columnId = moveTaskDto.targetColumnId;

    const savedTask = await this.taskRepository.save(task);

    await this.logActivity(
      `Moved task "${task.title}" from "${sourceColName}" to "${targetColumn.title}"`,
      task.id,
      userId,
    );

    return this.findOne(savedTask.id);
  }

  async assign(id: number, assignTaskDto: AssignTaskDto, userId: number): Promise<Task> {
    const task = await this.findOne(id);

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
        userId,
      );
    } else {
      task.assigneeId = null;
      await this.logActivity(`Unassigned task "${task.title}"`, task.id, userId);
    }

    const savedTask = await this.taskRepository.save(task);
    return this.findOne(savedTask.id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id);
    await this.logActivity(`Deleted task "${task.title}"`, null, userId);
    await this.taskRepository.remove(task);
  }
}

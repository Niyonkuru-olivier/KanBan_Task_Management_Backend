import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board, Workspace, ColumnEntity, Task, ActivityLog } from '../../entities';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(createBoardDto: CreateBoardDto, user: any): Promise<Board> {
    if (!createBoardDto.workspaceId) {
      throw new NotFoundException('Workspace ID is required');
    }
    await this.workspacesService.checkWorkspaceAccess(createBoardDto.workspaceId, user, false);

    const board = this.boardRepository.create({
      title: createBoardDto.title,
      workspaceId: createBoardDto.workspaceId,
    });

    const savedBoard = await this.boardRepository.save(board);

    // Create default Kanban columns: To Do, In Progress, Done
    const defaultColumns = [
      { title: 'To Do', position: 1, boardId: savedBoard.id },
      { title: 'In Progress', position: 2, boardId: savedBoard.id },
      { title: 'Done', position: 3, boardId: savedBoard.id },
    ];

    const columns = this.columnRepository.create(defaultColumns);
    await this.columnRepository.save(columns);

    return this.findOne(savedBoard.id, user);
  }

  async findAllByWorkspace(workspaceId: number, user: any): Promise<Board[]> {
    await this.workspacesService.checkWorkspaceAccess(workspaceId, user, false);

    return this.boardRepository.find({
      where: { workspaceId },
      relations: { columns: { tasks: true } },
      order: {
        createdAt: 'ASC',
        columns: {
          position: 'ASC',
        },
      },
    });
  }

  async findOne(id: number, user: any): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: { workspace: true, columns: { tasks: { assignee: true } } },
      order: {
        columns: {
          position: 'ASC',
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    await this.workspacesService.checkWorkspaceAccess(board.workspaceId, user, false);

    if (board.columns) {
      board.columns.forEach((col) => {
        if (col.tasks) {
          col.tasks.forEach((task) => {
            if (task.assignee) {
              delete (task.assignee as any).passwordHash;
            }
          });
        }
      });
    }

    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto, user: any): Promise<Board> {
    const board = await this.findOne(id, user);
    if (updateBoardDto.title) {
      board.title = updateBoardDto.title;
    }
    return this.boardRepository.save(board);
  }

  async remove(id: number, user: any): Promise<void> {
    const board = await this.findOne(id, user);
    await this.boardRepository.remove(board);
  }

  async getBoardActivity(id: number, user: any): Promise<ActivityLog[]> {
    const board = await this.findOne(id, user);

    return this.activityLogRepository.find({
      where: [
        { boardId: board.id },
        { column: { boardId: board.id } },
        { task: { column: { boardId: board.id } } }
      ],
      relations: { user: true, task: true, column: true, board: true },
      order: { timestamp: 'DESC' },
    });
  }

  async getBoardAnalytics(id: number, user: any) {
    const board = await this.findOne(id, user);

    const columns = board.columns || [];
    let totalTasks = 0;
    let completedTasks = 0;

    columns.forEach(column => {
      const tasksInColumn = column.tasks?.length || 0;
      totalTasks += tasksInColumn;
      
      // Assuming 'Done' or similar indicates completion
      if (column.title.toLowerCase().includes('done') || column.title.toLowerCase().includes('complete')) {
        completedTasks += tasksInColumn;
      }
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      boardId: board.id,
      boardTitle: board.title,
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 100) / 100, // round to 2 decimal places
    };
  }
}

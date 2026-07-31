import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board, Workspace, ColumnEntity } from '../../entities';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: createBoardDto.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID ${createBoardDto.workspaceId} not found`,
      );
    }

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

    return this.findOne(savedBoard.id);
  }

  async findAllByWorkspace(workspaceId: number): Promise<Board[]> {
    return this.boardRepository.find({
      where: { workspaceId },
      //relations: ['columns', 'columns.tasks'],
      relations: { columns: { tasks: true } },
      order: {
        createdAt: 'ASC',
        columns: {
          position: 'ASC',
        },
      },
    });
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      //relations: ['columns', 'columns.tasks', 'columns.tasks.assignee'],
      relations: { columns: { tasks: { assignee: true } } },
      order: {
        columns: {
          position: 'ASC',
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

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

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
  const board = await this.findOne(id);
  if (updateBoardDto.title) {
    board.title = updateBoardDto.title;
  }
  return this.boardRepository.save(board);
}

  async remove(id: number): Promise<void> {
    const board = await this.findOne(id);
    await this.boardRepository.remove(board);
  }
}

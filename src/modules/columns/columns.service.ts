import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity, Board } from '../../entities';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async checkBoardAccess(boardId: number, user: any): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: { workspace: true },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }
    
    await this.workspacesService.checkWorkspaceAccess(board.workspaceId, user, false);
    
    return board;
  }

  async create(createColumnDto: CreateColumnDto, user: any): Promise<ColumnEntity> {
    await this.checkBoardAccess(createColumnDto.boardId, user);

    let position = createColumnDto.position;
    if (position === undefined) {
      const highestPosColumn = await this.columnRepository.findOne({
        where: { boardId: createColumnDto.boardId },
        order: { position: 'DESC' },
      });
      position = highestPosColumn ? highestPosColumn.position + 1 : 1;
    }

    const column = this.columnRepository.create({
      title: createColumnDto.title,
      boardId: createColumnDto.boardId,
      position,
    });

    return this.columnRepository.save(column);
  }

  async findAllByBoard(boardId: number, user: any): Promise<ColumnEntity[]> {
    await this.checkBoardAccess(boardId, user);

    return this.columnRepository.find({
      where: { boardId },
      relations: { tasks: { assignee: true } },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: number, user: any): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: { tasks: { assignee: true }, board: { workspace: true } },
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    await this.workspacesService.checkWorkspaceAccess(column.board.workspaceId, user, false);

    return column;
  }

  async update(id: number, updateColumnDto: UpdateColumnDto, user: any): Promise<ColumnEntity> {
    const column = await this.findOne(id, user);

    if (updateColumnDto.title !== undefined) {
      column.title = updateColumnDto.title;
    }

    if (updateColumnDto.position !== undefined) {
      column.position = updateColumnDto.position;
    }

    return this.columnRepository.save(column);
  }

  async remove(id: number, user: any): Promise<void> {
    const column = await this.findOne(id, user);
    await this.columnRepository.remove(column);
  }
}



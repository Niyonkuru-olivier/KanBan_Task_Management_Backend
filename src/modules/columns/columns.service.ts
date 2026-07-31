import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity, Board } from '../../entities';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<ColumnEntity> {
    const board = await this.boardRepository.findOne({
      where: { id: createColumnDto.boardId },
    });

    if (!board) {
      throw new NotFoundException(
        `Board with ID ${createColumnDto.boardId} not found`,
      );
    }

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

  async findAllByBoard(boardId: number): Promise<ColumnEntity[]> {
    return this.columnRepository.find({
      where: { boardId },
      //relations: ['tasks', 'tasks.assignee'],
      relations: { tasks: { assignee: true } },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({
      where: { id },
      //relations: ['tasks', 'tasks.assignee'],
      relations: { tasks: { assignee: true } },
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    return column;
  }

  async update(
    id: number,
    updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnEntity> {
    const column = await this.findOne(id);

    if (updateColumnDto.title !== undefined) {
      column.title = updateColumnDto.title;
    }

    if (updateColumnDto.position !== undefined) {
      column.position = updateColumnDto.position;
    }

    return this.columnRepository.save(column);
  }

  async remove(id: number): Promise<void> {
    const column = await this.findOne(id);
    await this.columnRepository.remove(column);
  }
}

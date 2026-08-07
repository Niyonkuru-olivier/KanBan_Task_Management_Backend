import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter tasks by column ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  columnId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filter tasks by board ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  boardId?: number;

  @ApiPropertyOptional({ example: 5, description: 'Filter tasks by assignee user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigneeId?: number;

  @ApiPropertyOptional({ example: 'login', description: 'Search tasks by title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}

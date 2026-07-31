import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class TaskFilterDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  columnId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  boardId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigneeId?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

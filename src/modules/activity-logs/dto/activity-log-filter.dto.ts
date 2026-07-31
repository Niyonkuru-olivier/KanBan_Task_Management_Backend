import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ActivityLogFilterDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  taskId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}

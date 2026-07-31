import { IsInt, IsOptional } from 'class-validator';

export class AssignTaskDto {
  @IsOptional()
  @IsInt()
  assigneeId?: number | null;
}

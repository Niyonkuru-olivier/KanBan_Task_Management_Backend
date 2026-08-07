import { IsInt, IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiPropertyOptional({ example: 4, description: 'User ID of the assignee (or null to unassign)' })
  @IsOptional()
  @IsInt()
  assigneeId?: number | null;
}

import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated login feature' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description for the login task.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'ID of the new column' })
  @IsOptional()
  @IsInt()
  columnId?: number;

  @ApiPropertyOptional({ example: 6, description: 'User ID of the new assignee (or null to unassign)' })
  @IsOptional()
  @IsInt()
  assigneeId?: number | null;

  @ApiPropertyOptional({ example: '2027-01-15T23:59:59Z', description: 'Updated due date in ISO format' })
  @IsOptional()
  @IsString()
  dueDate?: string | null;

  @ApiPropertyOptional({ example: 'High', enum: ['Low', 'Medium', 'High'] })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ example: 2, description: 'New position inside the column' })
  @IsOptional()
  @IsInt()
  position?: number;
}

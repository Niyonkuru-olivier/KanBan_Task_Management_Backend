import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement login feature' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Create a login page with email and password fields.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, description: 'ID of the column where the task belongs' })
  @IsNotEmpty()
  @IsInt()
  columnId: number;

  @ApiPropertyOptional({ example: 5, description: 'User ID of the assignee' })
  @IsOptional()
  @IsInt()
  assigneeId?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', description: 'Due date in ISO format' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'High', enum: ['Low', 'Medium', 'High'] })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ example: 1, description: 'Position order inside the column' })
  @IsOptional()
  @IsInt()
  position?: number;
}

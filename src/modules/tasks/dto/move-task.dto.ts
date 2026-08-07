import { IsInt, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({ example: 3, description: 'ID of the target column to move the task to' })
  @IsNotEmpty()
  @IsInt()
  targetColumnId: number;
}

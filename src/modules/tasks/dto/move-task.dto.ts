import { IsInt, IsNotEmpty } from 'class-validator';

export class MoveTaskDto {
  @IsNotEmpty()
  @IsInt()
  targetColumnId: number;
}

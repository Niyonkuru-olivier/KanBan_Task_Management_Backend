import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsInt()
  boardId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;
}

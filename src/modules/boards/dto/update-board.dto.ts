import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiProperty()
  title?: string;
}
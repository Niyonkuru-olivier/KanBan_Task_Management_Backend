import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({
    example: 'Marketing Project',
    description: 'The name of the new workspace',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;
}


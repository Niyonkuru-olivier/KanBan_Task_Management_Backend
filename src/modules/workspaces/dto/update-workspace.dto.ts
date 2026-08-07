import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkspaceDto {
  @ApiProperty({
    example: 'Updated Marketing Project',
    description: 'The updated name of the workspace',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;
}


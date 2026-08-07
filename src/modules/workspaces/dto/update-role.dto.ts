import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'admin', description: 'New role for the user', enum: ['admin', 'member'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['admin', 'member'])
  role: string;
}

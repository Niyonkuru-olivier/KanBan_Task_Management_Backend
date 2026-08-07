import { IsNotEmpty, IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 2, description: 'ID of the user to invite' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'member', description: 'Role of the user in the workspace', enum: ['admin', 'member'] })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'member'])
  role?: string;
}

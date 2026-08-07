import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RegisterDto } from '../auth/dto/register.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a user (Admin only)' })
  create(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get profile of authenticated user' })
  getProfile(@CurrentUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  updateProfile(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a single user by ID (Admin only)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign or revoke role for a user (Admin only)' })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
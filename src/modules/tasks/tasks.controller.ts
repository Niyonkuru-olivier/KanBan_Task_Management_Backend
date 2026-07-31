import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks') // Swagger tag for this controller
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' }) // Swagger operation summary
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with optional filters' }) // Swagger operation summary
  findAll(@Query() filterDto: TaskFilterDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' }) // Swagger operation summary
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' }) // Swagger operation summary
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a task to another column' }) // Swagger operation summary
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveTaskDto: MoveTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tasksService.move(id, moveTaskDto, userId);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a task to a user' }) // Swagger operation summary
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tasksService.assign(id, assignTaskDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' }) // Swagger operation summary
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.tasksService.remove(id, userId);
  }
}
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
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks') // Swagger tag for this controller
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      'user-fillable': {
        summary: 'User fillable fields only',
        description: 'Only the fields that users need to provide',
        value: {
          title: 'Implement login feature',
          description: 'Create a login page with email and password fields',
          columnId: 1,
          assigneeId: 5,
          dueDate: '2026-12-31T23:59:59Z',
          priority: 'High',
          position: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    schema: {
      type: 'object',
      example: {
        id: 123,
        title: 'Implement login feature',
        description: 'Create a login page with email and password fields',
        columnId: 1,
        assigneeId: 5,
        dueDate: '2026-12-31T23:59:59.000Z',
        priority: 'High',
        position: 1,
        createdAt: '2026-08-07T16:20:00.000Z',
        updatedAt: '2026-08-07T16:20:00.000Z',
        column: {
          id: 1,
          name: 'To Do',
          boardId: 1,
          position: 0
        },
        assignee: {
          id: 5,
          username: 'john.doe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    schema: {
      type: 'object',
      example: {
        statusCode: 400,
        message: ['title should not be empty', 'columnId must be an integer number'],
        error: 'Bad Request'
      }
    }
  })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with optional filters' })
  @ApiQuery({ name: 'columnId', required: false, type: Number, description: 'Filter by column ID', example: 1 })
  @ApiQuery({ name: 'boardId', required: false, type: Number, description: 'Filter by board ID', example: 2 })
  @ApiQuery({ name: 'assigneeId', required: false, type: Number, description: 'Filter by assignee user ID', example: 5 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in title or description', example: 'login' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    schema: {
      type: 'object',
      example: {
        data: [
          {
            id: 123,
            title: 'Implement login feature',
            description: 'Create a login page with email and password fields',
            columnId: 1,
            assigneeId: 5,
            dueDate: '2026-12-31T23:59:59.000Z',
            priority: 'High',
            position: 1,
            createdAt: '2026-08-07T16:20:00.000Z',
            updatedAt: '2026-08-07T16:20:00.000Z',
            column: {
              id: 1,
              name: 'To Do',
              boardId: 1
            },
            assignee: {
              id: 5,
              username: 'john.doe',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3
      }
    }
  })
  findAll(@Query() filterDto: TaskFilterDto, @CurrentUser() user: any) {
    return this.tasksService.findAll(filterDto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    schema: {
      type: 'object',
      example: {
        id: 123,
        title: 'Implement login feature',
        description: 'Create a login page with email and password fields',
        columnId: 1,
        assigneeId: 5,
        dueDate: '2026-12-31T23:59:59.000Z',
        priority: 'High',
        position: 1,
        createdAt: '2026-08-07T16:20:00.000Z',
        updatedAt: '2026-08-07T16:20:00.000Z',
        column: {
          id: 1,
          name: 'To Do',
          boardId: 1,
          position: 0,
          createdAt: '2026-08-07T10:00:00.000Z'
        },
        assignee: {
          id: 5,
          username: 'john.doe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'member'
        },
        comments: [
          {
            id: 15,
            content: 'Please add validation for email format',
            authorId: 3,
            createdAt: '2026-08-07T17:30:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      example: {
        statusCode: 404,
        message: 'Task not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiBody({
    type: UpdateTaskDto,
    examples: {
      'user-fillable': {
        summary: 'User fillable fields only',
        description: 'Only the fields that users can modify (all optional)',
        value: {
          title: 'Updated login feature',
          description: 'Updated description for the login task',
          priority: 'Medium'
        }
      },
      'complete-update': {
        summary: 'Complete update example',
        description: 'Example showing all possible fields to update',
        value: {
          title: 'Updated login feature',
          description: 'Updated description for the login task',
          columnId: 2,
          assigneeId: 6,
          dueDate: '2027-01-15T23:59:59Z',
          priority: 'Medium',
          position: 2
        }
      },
      'unassign-task': {
        summary: 'Unassign task',
        description: 'Remove assignee from task',
        value: {
          assigneeId: null
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    schema: {
      type: 'object',
      example: {
        id: 123,
        title: 'Updated login feature',
        description: 'Updated description for the login task',
        columnId: 2,
        assigneeId: 6,
        dueDate: '2027-01-15T23:59:59.000Z',
        priority: 'Medium',
        position: 2,
        createdAt: '2026-08-07T16:20:00.000Z',
        updatedAt: '2026-08-07T18:45:00.000Z',
        column: {
          id: 2,
          name: 'In Progress',
          boardId: 1
        },
        assignee: {
          id: 6,
          username: 'jane.smith',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      example: {
        statusCode: 404,
        message: 'Task not found',
        error: 'Not Found'
      }
    }
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a task to another column' })
  @ApiBody({
    type: MoveTaskDto,
    examples: {
      'user-fillable': {
        summary: 'User fillable fields only',
        description: 'Only the target column ID is required',
        value: {
          targetColumnId: 3
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Task moved successfully',
    schema: {
      type: 'object',
      example: {
        id: 123,
        title: 'Implement login feature',
        description: 'Create a login page with email and password fields',
        columnId: 3,
        assigneeId: 5,
        dueDate: '2026-12-31T23:59:59.000Z',
        priority: 'High',
        position: 0,
        createdAt: '2026-08-07T16:20:00.000Z',
        updatedAt: '2026-08-07T19:15:00.000Z',
        column: {
          id: 3,
          name: 'Done',
          boardId: 1
        },
        assignee: {
          id: 5,
          username: 'john.doe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task or target column not found',
    schema: {
      type: 'object',
      example: {
        statusCode: 404,
        message: 'Target column not found',
        error: 'Not Found'
      }
    }
  })
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveTaskDto: MoveTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.move(id, moveTaskDto, user);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a task to a user' })
  @ApiBody({
    type: AssignTaskDto,
    examples: {
      'assign-user': {
        summary: 'Assign task to user',
        description: 'Assign task to a specific user',
        value: {
          assigneeId: 4
        }
      },
      'unassign-user': {
        summary: 'Unassign task',
        description: 'Remove assignee from task',
        value: {
          assigneeId: null
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Task assignment updated successfully',
    schema: {
      type: 'object',
      example: {
        id: 123,
        title: 'Implement login feature',
        description: 'Create a login page with email and password fields',
        columnId: 1,
        assigneeId: 4,
        dueDate: '2026-12-31T23:59:59.000Z',
        priority: 'High',
        position: 1,
        createdAt: '2026-08-07T16:20:00.000Z',
        updatedAt: '2026-08-07T19:30:00.000Z',
        column: {
          id: 1,
          name: 'To Do',
          boardId: 1
        },
        assignee: {
          id: 4,
          username: 'mike.johnson',
          email: 'mike.johnson@example.com',
          firstName: 'Mike',
          lastName: 'Johnson'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task or assignee not found',
    schema: {
      type: 'object',
      example: {
        statusCode: 404,
        message: 'Assignee user not found',
        error: 'Not Found'
      }
    }
  })
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.assign(id, assignTaskDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    schema: {
      type: 'object',
      example: {
        message: 'Task deleted successfully',
        taskId: 123
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      example: {
        statusCode: 404,
        message: 'Task not found',
        error: 'Not Found'
      }
    }
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.remove(id, user);
  }
}
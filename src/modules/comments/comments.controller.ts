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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('comments') // Swagger tag for this controller
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(createCommentDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a task' })
  findAllByTask(@Query('taskId', ParseIntPipe) taskId: number, @CurrentUser() user: any) {
    return this.commentsService.findAllByTask(taskId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single comment by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.commentsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.remove(id, user);
  }
}
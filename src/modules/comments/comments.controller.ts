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
  @ApiOperation({ summary: 'Create a comment' }) // Swagger operation summary
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.create(createCommentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a task' }) // Swagger operation summary
  findAllByTask(@Query('taskId', ParseIntPipe) taskId: number) {
    return this.commentsService.findAllByTask(taskId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single comment by ID' }) // Swagger operation summary
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment by ID' }) // Swagger operation summary
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' }) // Swagger operation summary
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.remove(id, userId);
  }
}
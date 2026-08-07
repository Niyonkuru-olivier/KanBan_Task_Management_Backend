import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, Task } from '../../entities';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  private async checkTaskAccess(taskId: number, user: any) {
    if (user.role === 'admin') return;

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { column: { board: { workspace: true } } },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const isOwner = task.column?.board?.workspace?.ownerId === user.id;
    const isAssignee = task.assigneeId === user.id;

    if (!isOwner && !isAssignee) {
      throw new ForbiddenException('You do not have access to this task');
    }
  }

  async create(createCommentDto: CreateCommentDto, user: any): Promise<Comment> {
    await this.checkTaskAccess(createCommentDto.taskId, user);

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      taskId: createCommentDto.taskId,
      authorId: user.id,
    });

    const saved = await this.commentRepository.save(comment);
    return this.findOne(saved.id, user);
  }

  async findAllByTask(taskId: number, user: any): Promise<Comment[]> {
    await this.checkTaskAccess(taskId, user);

    const comments = await this.commentRepository.find({
      where: { taskId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });

    comments.forEach((c) => {
      if (c.author) {
        delete (c.author as any).passwordHash;
      }
    });

    return comments;
  }

  async findOne(id: number, user: any): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: { author: true, task: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.checkTaskAccess(comment.taskId, user);

    if (comment.author) {
      delete (comment.author as any).passwordHash;
    }

    return comment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: any,
  ): Promise<Comment> {
    const comment = await this.findOne(id, user);
    
    if (comment.authorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the author or an admin can update this comment');
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async remove(id: number, user: any): Promise<void> {
    const comment = await this.findOne(id, user);
    
    if (comment.authorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the author or an admin can delete this comment');
    }

    await this.commentRepository.remove(comment);
  }
}


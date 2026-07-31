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

  async create(createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    const task = await this.taskRepository.findOne({
      where: { id: createCommentDto.taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${createCommentDto.taskId} not found`);
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      taskId: createCommentDto.taskId,
      authorId: userId,
    });

    const saved = await this.commentRepository.save(comment);
    return this.findOne(saved.id);
  }

  async findAllByTask(taskId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { taskId },
      //relations: ['author'],
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

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      //relations: ['author', 'task'],
      relations: { author: true, task: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.author) {
      delete (comment.author as any).passwordHash;
    }

    return comment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can update this comment');
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    await this.commentRepository.remove(comment);
  }
}

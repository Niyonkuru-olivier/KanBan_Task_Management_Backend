// filepath: c:\Users\Olivier\Documents\ICT Chamber\kanban_task\src\modules\activity-logs\activity-logs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities';
import { ActivityLogFilterDto } from './dto/activity-log-filter.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async findAll(filterDto: ActivityLogFilterDto): Promise<PaginatedResult<ActivityLog>> {
    const { page = 1, limit = 10, taskId, userId } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.task', 'task')
      .leftJoinAndSelect('log.user', 'user');

    if (taskId) {
      queryBuilder.andWhere('log.taskId = :taskId', { taskId });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    queryBuilder
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    data.forEach((log) => {
      if (log.user) {
        delete (log.user as any).passwordHash;
      }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ActivityLog> {
    const log = await this.activityLogRepository.findOne({
      where: { id },
      relations: { task: true, user: true },
    });

    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    if (log.user) {
      delete (log.user as any).passwordHash;
    }

    return log;
  }
}
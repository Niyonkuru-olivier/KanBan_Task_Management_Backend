import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Task } from '../../entities/task.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const activeWorkspaces = await this.workspaceRepository.count();
    const totalTasks = await this.taskRepository.count();

    // Ideally, "completed" would mean tasks in a "Done" column or having a status.
    // We'll count tasks assigned to a column that has 'done' in its title (case insensitive).
    const tasksCompletedQuery = this.taskRepository.createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('LOWER(column.title) LIKE :title', { title: '%done%' });
      
    const tasksCompleted = await tasksCompletedQuery.getCount();

    return {
      message: 'System statistics',
      stats: {
        totalUsers,
        activeWorkspaces,
        totalTasks,
        tasksCompletedThisWeek: tasksCompleted, // Note: You can add date filtering for "ThisWeek" if needed
      },
    };
  }
}

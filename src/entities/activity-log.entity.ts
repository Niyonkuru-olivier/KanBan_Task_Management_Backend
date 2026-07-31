import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn({ length: 255 })
  action: string;

  @TypeOrmColumn({ name: 'task_id', nullable: true })
  taskId: number | null;

  @TypeOrmColumn({ name: 'user_id', nullable: true })
  userId: number | null;

  @CreateDateColumn({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Task, (task) => task.activityLogs, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task | null;

  @ManyToOne(() => User, (user) => user.activityLogs, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}

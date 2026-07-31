import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ColumnEntity } from './column.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn({ length: 150 })
  title: string;

  @TypeOrmColumn({ type: 'text', nullable: true })
  description: string | null;

  @TypeOrmColumn({ name: 'column_id' })
  columnId: number;

  @TypeOrmColumn({ name: 'assignee_id', nullable: true })
  assigneeId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => ColumnEntity, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @OneToMany(() => ActivityLog, (log) => log.task)
  activityLogs: ActivityLog[];
}

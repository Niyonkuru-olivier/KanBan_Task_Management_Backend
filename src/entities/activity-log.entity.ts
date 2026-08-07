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
import { Workspace } from './workspace.entity';
import { Board } from './board.entity';
import { ColumnEntity } from './column.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn({ length: 255 })
  action: string;

  @TypeOrmColumn({ name: 'workspace_id', nullable: true })
  workspaceId: number | null;

  @TypeOrmColumn({ name: 'board_id', nullable: true })
  boardId: number | null;

  @TypeOrmColumn({ name: 'column_id', nullable: true })
  columnId: number | null;

  @TypeOrmColumn({ name: 'task_id', nullable: true })
  taskId: number | null;

  @TypeOrmColumn({ name: 'user_id', nullable: true })
  userId: number | null;

  @CreateDateColumn({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Workspace, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace | null;

  @ManyToOne(() => Board, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board | null;

  @ManyToOne(() => ColumnEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity | null;

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


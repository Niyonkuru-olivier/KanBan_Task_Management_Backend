import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { Task } from './task.entity';

@Entity('columns')
export class ColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn({ length: 100 })
  title: string;

  @TypeOrmColumn({ type: 'integer' })
  position: number;

  @TypeOrmColumn({ name: 'board_id' })
  boardId: number;

  @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany(() => Task, (task) => task.column)
  tasks: Task[];
}

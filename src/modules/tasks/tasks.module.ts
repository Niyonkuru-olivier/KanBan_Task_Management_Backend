import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task, ColumnEntity, User, ActivityLog } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task, ColumnEntity, User, ActivityLog])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

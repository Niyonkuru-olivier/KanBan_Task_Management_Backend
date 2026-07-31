import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board, Workspace, ColumnEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Workspace, ColumnEntity])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}

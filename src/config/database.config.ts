import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, Workspace, Board, ColumnEntity, Task, Comment, ActivityLog } from '../entities';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Da1wi2d$',
    database: process.env.DB_NAME || 'kanban_db',
    entities: [User, Workspace, Board, ColumnEntity, Task, Comment, ActivityLog],
    synchronize: process.env.NODE_ENV !== 'production', // sync in dev, migrations for prod
    logging: process.env.NODE_ENV === 'development',
  }),
);

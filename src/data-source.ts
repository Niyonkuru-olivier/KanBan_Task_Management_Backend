import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User, Workspace, Board, ColumnEntity, Task, Comment, ActivityLog } from './entities';

dotenv.config();

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('sslmode=') && !dbUrl.includes('uselibpqcompat=')) {
  const separator = dbUrl.includes('?') ? '&' : '?';
  dbUrl = `${dbUrl}${separator}uselibpqcompat=true`;
}

export const AppDataSource = new DataSource(
  dbUrl
    ? {
        type: 'postgres',
        url: dbUrl,
        ssl: { rejectUnauthorized: false },
        extra: { ssl: { rejectUnauthorized: false } },
        entities: [User, Workspace, Board, ColumnEntity, Task, Comment, ActivityLog],
        migrations: ['src/migrations/*.ts'],
        synchronize: false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Da1wi2d$',
        database: process.env.DB_NAME || 'kanban_db',
        entities: [User, Workspace, Board, ColumnEntity, Task, Comment, ActivityLog],
        migrations: ['src/migrations/*.ts'],
        synchronize: false,
      },
);

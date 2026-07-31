import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { CommentsModule } from './modules/comments/comments.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        let databaseUrl = config.get<string>('DATABASE_URL');

        if (databaseUrl) {
          if (databaseUrl.includes('sslmode=') && !databaseUrl.includes('uselibpqcompat=')) {
            const separator = databaseUrl.includes('?') ? '&' : '?';
            databaseUrl = `${databaseUrl}${separator}uselibpqcompat=true`;
          }

          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            extra: {
              ssl: { rejectUnauthorized: false },
            },
            autoLoadEntities: true,
            synchronize: false,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASS', 'password'),
          database: config.get<string>('DB_NAME', 'kanban_db'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    AuthModule,
    BoardsModule,
    ColumnsModule,
    CommentsModule,
    TasksModule,
    WorkspacesModule,
    ActivityLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
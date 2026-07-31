import { Injectable } from '@nestjs/common';

export interface SystemStatus {
  name: string;
  version: string;
  status: string;
  message: string;
  timestamp: string;
  documentation: string;
  environment: string;
  endpoints: Record<string, string>;
}

@Injectable()
export class AppService {
  getSystemStatus(): SystemStatus {
    return {
      name: 'Kanban Task Management API',
      version: '1.0.0',
      status: 'online',
      message: 'Kanban Task Management System API is operational',
      timestamp: new Date().toISOString(),
      documentation: '/api',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: '/auth',
        workspaces: '/workspaces',
        boards: '/boards',
        columns: '/columns',
        tasks: '/tasks',
        comments: '/comments',
        users: '/users',
        activityLogs: '/activity-logs',
      },
    };
  }
}

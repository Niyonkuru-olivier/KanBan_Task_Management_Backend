import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService, SystemStatus } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API System Status & Information' })
  @ApiResponse({
    status: 200,
    description: 'System health status and endpoint directory',
  })
  getSystemStatus(): SystemStatus {
    return this.appService.getSystemStatus();
  }
}

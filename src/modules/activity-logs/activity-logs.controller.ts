import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogFilterDto } from './dto/activity-log-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('activity-logs') // Swagger tag for this controller
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs with optional filters' }) // Swagger operation summary
  findAll(@Query() filterDto: ActivityLogFilterDto) {
    return this.activityLogsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single activity log by ID' }) // Swagger operation summary
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activityLogsService.findOne(id);
  }
}
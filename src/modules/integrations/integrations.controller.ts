import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations (Admin only)' })
  findAll() {
    return this.integrationsService.findAll();
  }

  @Post('configure')
  @ApiOperation({ summary: 'Configure an integration (Admin only)' })
  configure(@Body() body: { provider: string; config: any; isActive: boolean }) {
    return this.integrationsService.configure(body.provider, body.config, body.isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an integration (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.integrationsService.remove(id);
  }
}

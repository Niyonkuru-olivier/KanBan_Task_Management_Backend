import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('workspaces') // Swagger tag for this controller
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' }) // Swagger operation summary
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.workspacesService.create(createWorkspaceDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for the authenticated user' }) // Swagger operation summary
  findAll(@CurrentUser('id') userId: number) {
    return this.workspacesService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single workspace by ID' }) // Swagger operation summary
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workspace by ID' }) // Swagger operation summary
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace by ID' }) // Swagger operation summary
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.workspacesService.remove(id, userId);
  }
}
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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('workspaces') // Swagger tag for this controller
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' }) // Swagger operation summary
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for the authenticated user' }) // Swagger operation summary
  findAll(@CurrentUser() user: any) {
    return this.workspacesService.findAllForUser(user);
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
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace by ID' }) // Swagger operation summary
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.remove(id, user);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member to the workspace' })
  addMember(
    @Param('id', ParseIntPipe) workspaceId: number,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.addMember(workspaceId, addMemberDto, user);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Change a workspace member role' })
  updateMemberRole(
    @Param('id', ParseIntPipe) workspaceId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.updateMemberRole(workspaceId, targetUserId, updateRoleDto, user);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  removeMember(
    @Param('id', ParseIntPipe) workspaceId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.removeMember(workspaceId, targetUserId, user);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get all activity logs for the workspace' })
  getActivityLogs(
    @Param('id', ParseIntPipe) workspaceId: number,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.getActivityLogs(workspaceId, user);
  }
}
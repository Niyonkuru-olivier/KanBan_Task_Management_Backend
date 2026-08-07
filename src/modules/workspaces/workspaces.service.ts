import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace, WorkspaceMember, User, ActivityLog } from '../../entities';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async checkWorkspaceAccess(workspaceId: number, user: any, requireAdmin: boolean = false): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId);

    if (user.role === 'admin') return workspace;

    const membership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: user.id },
    });

    if (!membership) {
      if (workspace.ownerId === user.id) return workspace; // Fallback for owner
      throw new ForbiddenException('You do not have access to this workspace');
    }

    if (requireAdmin && membership.role !== 'admin' && workspace.ownerId !== user.id) {
      throw new ForbiddenException('You must be a workspace admin to perform this action');
    }

    return workspace;
  }

  async create(createWorkspaceDto: CreateWorkspaceDto, user: any): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      name: createWorkspaceDto.name,
      ownerId: user.id,
    });
    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // Auto-create admin membership for the creator
    const member = this.workspaceMemberRepository.create({
      workspaceId: savedWorkspace.id,
      userId: user.id,
      role: 'admin',
    });
    await this.workspaceMemberRepository.save(member);

    return savedWorkspace;
  }

  async findAllForUser(user: any): Promise<Workspace[]> {
    if (user.role === 'admin') {
      return this.workspaceRepository.find({
        relations: { boards: true },
        order: { createdAt: 'DESC' },
      });
    }

    const memberships = await this.workspaceMemberRepository.find({
      where: { userId: user.id },
      relations: { workspace: { boards: true } },
    });

    return memberships.map(m => m.workspace).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findOne(id: number): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: { owner: true, boards: true, members: { user: true } },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    if (workspace.owner) {
      delete (workspace.owner as any).passwordHash;
    }
    if (workspace.members) {
      workspace.members.forEach(m => {
        if (m.user) delete (m.user as any).passwordHash;
      });
    }

    return workspace;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto, user: any): Promise<Workspace> {
    const workspace = await this.checkWorkspaceAccess(id, user, true);
    workspace.name = updateWorkspaceDto.name;
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: number, user: any): Promise<void> {
    const workspace = await this.checkWorkspaceAccess(id, user, true);
    await this.workspaceRepository.remove(workspace);
  }

  // --- Member Management ---

  async addMember(workspaceId: number, addMemberDto: AddMemberDto, user: any): Promise<WorkspaceMember> {
    await this.checkWorkspaceAccess(workspaceId, user, true);

    const targetUser = await this.userRepository.findOne({ where: { id: addMemberDto.userId } });
    if (!targetUser) throw new NotFoundException('User not found');

    const existing = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: addMemberDto.userId },
    });
    if (existing) throw new ConflictException('User is already a member of this workspace');

    const member = this.workspaceMemberRepository.create({
      workspaceId,
      userId: addMemberDto.userId,
      role: addMemberDto.role || 'member',
    });

    return this.workspaceMemberRepository.save(member);
  }

  async updateMemberRole(workspaceId: number, targetUserId: number, updateRoleDto: UpdateRoleDto, user: any): Promise<WorkspaceMember> {
    await this.checkWorkspaceAccess(workspaceId, user, true);

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: targetUserId },
    });
    if (!member) throw new NotFoundException('User is not a member of this workspace');

    member.role = updateRoleDto.role;
    return this.workspaceMemberRepository.save(member);
  }

  async removeMember(workspaceId: number, targetUserId: number, user: any): Promise<void> {
    await this.checkWorkspaceAccess(workspaceId, user, true);

    const member = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: targetUserId },
    });
    if (!member) throw new NotFoundException('User is not a member of this workspace');

    await this.workspaceMemberRepository.remove(member);
  }

  // --- Activity Tracking ---

  async getActivityLogs(workspaceId: number, user: any): Promise<ActivityLog[]> {
    await this.checkWorkspaceAccess(workspaceId, user, false);

    return this.activityLogRepository.find({
      where: [
        { workspaceId },
        { board: { workspaceId } },
        { column: { board: { workspaceId } } },
        { task: { column: { board: { workspaceId } } } }
      ],
      relations: { user: true, task: true, column: true, board: true },
      order: { timestamp: 'DESC' },
    });
  }
}


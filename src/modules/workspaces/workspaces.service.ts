import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../entities';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: number): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      name: createWorkspaceDto.name,
      ownerId: userId,
    });
    return this.workspaceRepository.save(workspace);
  }

  async findAllForUser(userId: number): Promise<Workspace[]> {
    return this.workspaceRepository.find({
      where: { ownerId: userId },
      //relations: ['boards'],
      relations: { boards: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      //relations: ['owner', 'boards'],
      relations: { owner: true, boards: true },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    if (workspace.owner) {
      delete (workspace.owner as any).passwordHash;
    }

    return workspace;
  }

  async update(
    id: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: number,
  ): Promise<Workspace> {
    const workspace = await this.findOne(id);
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the workspace owner can perform this action');
    }

    workspace.name = updateWorkspaceDto.name;
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: number, userId: number): Promise<void> {
    const workspace = await this.findOne(id);
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the workspace owner can delete this workspace');
    }

    await this.workspaceRepository.remove(workspace);
  }
}

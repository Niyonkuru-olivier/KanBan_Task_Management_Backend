import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../../entities/integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
  ) {}

  async findAll(): Promise<Integration[]> {
    return this.integrationRepository.find();
  }

  async configure(provider: string, config: any, isActive: boolean): Promise<Integration> {
    let integration = await this.integrationRepository.findOne({ where: { provider } });
    if (integration) {
      integration.config = config;
      if (isActive !== undefined) integration.isActive = isActive;
    } else {
      integration = this.integrationRepository.create({ provider, config, isActive });
    }
    return this.integrationRepository.save(integration);
  }

  async remove(id: number): Promise<void> {
    const integration = await this.integrationRepository.findOne({ where: { id } });
    if (!integration) throw new NotFoundException(`Integration with ID ${id} not found`);
    await this.integrationRepository.remove(integration);
  }
}

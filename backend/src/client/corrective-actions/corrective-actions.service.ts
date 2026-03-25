import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorrectiveActionPlan, CorrectiveActionStatus } from '../../database/entities/corrective-action-plan.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ClientCorrectiveActionsService {
  constructor(
    @InjectRepository(CorrectiveActionPlan)
    private readonly repo: Repository<CorrectiveActionPlan>,
  ) {}

  async findAll(clientId: string, auditId?: string) {
    const query = this.repo.createQueryBuilder('cap')
      .leftJoinAndSelect('cap.audit', 'audit')
      .leftJoinAndSelect('cap.lineItem', 'li')
      .leftJoinAndSelect('cap.assignee', 'assignee')
      .where('audit.clientId = :clientId', { clientId });

    if (auditId) {
      query.andWhere('cap.auditId = :auditId', { auditId });
    }

    return query.getMany();
  }

  async findOne(id: string, clientId: string) {
    const plan = await this.repo.findOne({
      where: { id, audit: { clientId } },
      relations: ['audit', 'lineItem', 'assignee'],
    });

    if (!plan) throw new NotFoundException('Corrective action plan not found');
    return plan;
  }

  async create(user: User, data: any) {
    const plan = this.repo.create({
      ...data,
      createdBy: user.id,
    });
    return this.repo.save(plan);
  }

  async update(id: string, clientId: string, data: any) {
    const plan = await this.findOne(id, clientId);
    Object.assign(plan, data);
    return this.repo.save(plan);
  }

  async delete(id: string, clientId: string) {
    const plan = await this.findOne(id, clientId);
    return this.repo.softRemove(plan);
  }
}

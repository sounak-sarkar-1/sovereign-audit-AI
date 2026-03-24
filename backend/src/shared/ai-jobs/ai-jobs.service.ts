import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PgBoss, type WorkHandler } from 'pg-boss';
import { AiJob } from '../../database/entities/ai-job.entity';

@Injectable()
export class AiJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiJobsService.name);
  private boss: PgBoss;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AiJob)
    private readonly aiJobRepository: Repository<AiJob>,
  ) {}

  async onModuleInit() {
    const dbUrl = this.configService.get<string>('database.url');
    try {
      this.boss = new PgBoss(dbUrl);
      this.boss.on('error', (error) => this.logger.error(error));
      await this.boss.start();
      this.logger.log('PgBoss started');
    } catch (error) {
      this.logger.error(`Failed to start PgBoss: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.boss) {
      this.logger.log('Stopping PgBoss');
      await this.boss.stop();
    }
  }

  async send(queue: string, data: any, options?: any) {
    return await this.boss.send(queue, data, options);
  }

  async work<T = any>(queue: string, handler: WorkHandler<T>) {
    return await this.boss.work(queue, handler);
  }

  async findOne(id: string): Promise<AiJob> {
    const job = await this.aiJobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('AI Job not found');
    }
    return job;
  }
}
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
  private ready: Promise<void>;
  private resolveReady: () => void;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AiJob)
    private readonly aiJobRepository: Repository<AiJob>,
  ) {
    this.ready = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  async onModuleInit() {
    this.logger.log('AI Jobs Module Init started');
    const dbUrl = this.configService.get<string>('database.url');
    try {
      this.logger.log(`Initializing PgBoss...`);
      this.boss = new PgBoss(dbUrl);
      this.boss.on('error', (error) =>
        this.logger.error(`PgBoss Error: ${error.message}`, error.stack),
      );

      this.logger.log('Starting PgBoss in background...');
      this.boss
        .start()
        .then(async () => {
          this.logger.log('PgBoss started successfully, creating queues...');
          await this.boss.createQueue('scope-extraction');
          await this.boss.createQueue('report-generation');
          await this.boss.createQueue('nl-search');
          this.logger.log('Queues [scope-extraction, report-generation, nl-search] created successfully');
          this.logger.log('PgBoss ready signal resolving...');
          this.resolveReady();
        })
        .catch((err) => {
          this.logger.error(
            `Failed to start PgBoss: ${err.message}`,
            err.stack,
          );
        });
    } catch (error) {
      this.logger.error(
        `Critical PgBoss Initialization Failure: ${error.message}`,
        error.stack,
      );
    }
  }

  async onModuleDestroy() {
    if (this.boss) {
      this.logger.log('Stopping PgBoss');
      await this.boss.stop();
    }
  }

  async send(queue: string, data: any, options?: any) {
    await this.ready;
    return await this.boss.send(queue, data, options);
  }

  async work<T = any>(queue: string, handler: WorkHandler<T>) {
    await this.ready;
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

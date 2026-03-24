import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiJob, JobStatus } from '../../database/entities/ai-job.entity';

@Injectable()
export class ScopeExtractionWorker implements OnModuleInit {
  private readonly logger = new Logger(ScopeExtractionWorker.name);

  constructor(
    private readonly aiJobsService: AiJobsService,
    @InjectRepository(AiJob)
    private readonly aiJobRepository: Repository<AiJob>,
  ) {}

  async onModuleInit() {
    this.logger.log('Registering scope-extraction worker');
    try {
      await this.aiJobsService.work('scope-extraction', async (job: any) => {
        const jobData = Array.isArray(job) ? job[0].data : job.data;
        const jobId = jobData.jobId;
        this.logger.log(`Processing scope-extraction job ${jobId}`);
        await this.processJob(jobId);
      });
    } catch (error) {
      this.logger.error(`Failed to register worker: ${error.message}`);
    }
  }

  async processJob(jobId: string) {
    const aiJob = await this.aiJobRepository.findOne({ where: { id: jobId } });
    if (!aiJob) return;

    await this.aiJobRepository.update(jobId, { status: JobStatus.PROCESSING });

    try {
      this.logger.log(`Simulating AI extraction for job ${jobId}...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const mockExtractedItems = [
        {
          name: 'User Access Review',
          description:
            'Verify all users have appropriate access level and permissions are revoked for terminated employees.',
          inputMethod: 'free_text',
        },
        {
          name: 'Backup Success Verification',
          description:
            'Confirm that backups for all critical databases have been successful for the last 30 days.',
          inputMethod: 'multiple_choice',
          options: ['Success', 'Partial Failure', 'Total Failure'],
        },
        {
          name: 'Security Patch Management',
          description:
            'Ensure all critical security patches are applied within 14 days of release.',
          inputMethod: 'free_text',
        },
      ];

      await this.aiJobRepository.update(jobId, {
        status: JobStatus.COMPLETED,
        outputPayload: { items: mockExtractedItems },
        completedAt: new Date(),
      });

      this.logger.log(`Job ${jobId} completed successfully`);
    } catch (error) {
      this.logger.error(`Job ${jobId} failed: ${error.message}`);
      await this.aiJobRepository.update(jobId, {
        status: JobStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ScopeExtractionWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeExtractionWorker = void 0;
const common_1 = require("@nestjs/common");
const ai_jobs_service_1 = require("../../shared/ai-jobs/ai-jobs.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
let ScopeExtractionWorker = ScopeExtractionWorker_1 = class ScopeExtractionWorker {
    constructor(aiJobsService, aiJobRepository) {
        this.aiJobsService = aiJobsService;
        this.aiJobRepository = aiJobRepository;
        this.logger = new common_1.Logger(ScopeExtractionWorker_1.name);
    }
    async onModuleInit() {
        this.logger.log('Registering scope-extraction worker');
        try {
            await this.aiJobsService.work('scope-extraction', async (job) => {
                const jobData = Array.isArray(job) ? job[0].data : job.data;
                const jobId = jobData.jobId;
                this.logger.log(`Processing scope-extraction job ${jobId}`);
                await this.processJob(jobId);
            });
        }
        catch (error) {
            this.logger.error(`Failed to register worker: ${error.message}`);
        }
    }
    async processJob(jobId) {
        const aiJob = await this.aiJobRepository.findOne({ where: { id: jobId } });
        if (!aiJob)
            return;
        await this.aiJobRepository.update(jobId, { status: ai_job_entity_1.JobStatus.PROCESSING });
        try {
            this.logger.log(`Simulating AI extraction for job ${jobId}...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const mockExtractedItems = [
                {
                    name: 'User Access Review',
                    description: 'Verify all users have appropriate access level and permissions are revoked for terminated employees.',
                    inputMethod: 'free_text',
                },
                {
                    name: 'Backup Success Verification',
                    description: 'Confirm that backups for all critical databases have been successful for the last 30 days.',
                    inputMethod: 'multiple_choice',
                    options: ['Success', 'Partial Failure', 'Total Failure'],
                },
                {
                    name: 'Security Patch Management',
                    description: 'Ensure all critical security patches are applied within 14 days of release.',
                    inputMethod: 'free_text',
                },
            ];
            await this.aiJobRepository.update(jobId, {
                status: ai_job_entity_1.JobStatus.COMPLETED,
                outputPayload: { items: mockExtractedItems },
                completedAt: new Date(),
            });
            this.logger.log(`Job ${jobId} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Job ${jobId} failed: ${error.message}`);
            await this.aiJobRepository.update(jobId, {
                status: ai_job_entity_1.JobStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }
};
exports.ScopeExtractionWorker = ScopeExtractionWorker;
exports.ScopeExtractionWorker = ScopeExtractionWorker = ScopeExtractionWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __metadata("design:paramtypes", [ai_jobs_service_1.AiJobsService,
        typeorm_2.Repository])
], ScopeExtractionWorker);
//# sourceMappingURL=scope-extraction.worker.js.map
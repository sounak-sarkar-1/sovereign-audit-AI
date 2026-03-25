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
var AuditorSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorSearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const ai_jobs_service_1 = require("../../shared/ai-jobs/ai-jobs.service");
let AuditorSearchService = AuditorSearchService_1 = class AuditorSearchService {
    constructor(aiJobRepo, aiJobsService, dataSource) {
        this.aiJobRepo = aiJobRepo;
        this.aiJobsService = aiJobsService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(AuditorSearchService_1.name);
    }
    async search(dto, auditorId) {
        return await this.dataSource.transaction(async (manager) => {
            const aiJob = manager.create(ai_job_entity_1.AiJob, {
                jobType: ai_job_entity_1.JobType.NL_SEARCH,
                status: ai_job_entity_1.JobStatus.QUEUED,
                createdBy: auditorId,
                inputPayload: {
                    query: dto.query,
                    context: 'situational_research',
                    role: 'auditor'
                },
            });
            const savedJob = await manager.save(aiJob);
            await this.aiJobsService.send('nl-search', {
                jobId: savedJob.id,
                query: dto.query,
                auditorId
            });
            return { jobId: savedJob.id };
        });
    }
    async getJobStatus(jobId) {
        return this.aiJobRepo.findOne({
            where: { id: jobId }
        });
    }
};
exports.AuditorSearchService = AuditorSearchService;
exports.AuditorSearchService = AuditorSearchService = AuditorSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_jobs_service_1.AiJobsService,
        typeorm_2.DataSource])
], AuditorSearchService);
//# sourceMappingURL=search.service.js.map
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
var AiJobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiJobsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pg_boss_1 = require("pg-boss");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
let AiJobsService = AiJobsService_1 = class AiJobsService {
    constructor(configService, aiJobRepository) {
        this.configService = configService;
        this.aiJobRepository = aiJobRepository;
        this.logger = new common_1.Logger(AiJobsService_1.name);
    }
    async onModuleInit() {
        const dbUrl = this.configService.get('database.url');
        try {
            this.boss = new pg_boss_1.PgBoss(dbUrl);
            this.boss.on('error', (error) => this.logger.error(error));
            await this.boss.start();
            this.logger.log('PgBoss started');
        }
        catch (error) {
            this.logger.error(`Failed to start PgBoss: ${error.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.boss) {
            this.logger.log('Stopping PgBoss');
            await this.boss.stop();
        }
    }
    async send(queue, data, options) {
        return await this.boss.send(queue, data, options);
    }
    async work(queue, handler) {
        return await this.boss.work(queue, handler);
    }
    async findOne(id) {
        const job = await this.aiJobRepository.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException('AI Job not found');
        }
        return job;
    }
};
exports.AiJobsService = AiJobsService;
exports.AiJobsService = AiJobsService = AiJobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], AiJobsService);
//# sourceMappingURL=ai-jobs.service.js.map
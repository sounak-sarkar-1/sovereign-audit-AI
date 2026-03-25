"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorSearchModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const search_controller_1 = require("./search.controller");
const search_service_1 = require("./search.service");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const ai_jobs_module_1 = require("../../shared/ai-jobs/ai-jobs.module");
let AuditorSearchModule = class AuditorSearchModule {
};
exports.AuditorSearchModule = AuditorSearchModule;
exports.AuditorSearchModule = AuditorSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([ai_job_entity_1.AiJob]),
            ai_jobs_module_1.AiJobsModule,
        ],
        controllers: [search_controller_1.AuditorSearchController],
        providers: [search_service_1.AuditorSearchService],
        exports: [search_service_1.AuditorSearchService],
    })
], AuditorSearchModule);
//# sourceMappingURL=search.module.js.map
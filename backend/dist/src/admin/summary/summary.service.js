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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSummaryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const exceptional_action_request_entity_1 = require("../../database/entities/exceptional-action-request.entity");
let AdminSummaryService = class AdminSummaryService {
    constructor(userRepository, auditRepository, requestRepository) {
        this.userRepository = userRepository;
        this.auditRepository = auditRepository;
        this.requestRepository = requestRepository;
    }
    async getDashboardSummary() {
        const [totalUsers, activeAudits, pendingRequests] = await Promise.all([
            this.userRepository.count(),
            this.auditRepository.count({ where: { status: audit_entity_1.AuditStatus.IN_PROGRESS } }),
            this.requestRepository.count({ where: { status: exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING } }),
        ]);
        return {
            totalUsers,
            activeAudits,
            pendingRequests,
            systemHealth: '99.9%',
        };
    }
};
exports.AdminSummaryService = AdminSummaryService;
exports.AdminSummaryService = AdminSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(2, (0, typeorm_1.InjectRepository)(exceptional_action_request_entity_1.ExceptionalActionRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminSummaryService);
//# sourceMappingURL=summary.service.js.map
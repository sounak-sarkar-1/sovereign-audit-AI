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
exports.ClientCorrectiveActionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const corrective_action_plan_entity_1 = require("../../database/entities/corrective-action-plan.entity");
let ClientCorrectiveActionsService = class ClientCorrectiveActionsService {
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(clientId, auditId) {
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
    async findOne(id, clientId) {
        const plan = await this.repo.findOne({
            where: { id, audit: { clientId } },
            relations: ['audit', 'lineItem', 'assignee'],
        });
        if (!plan)
            throw new common_1.NotFoundException('Corrective action plan not found');
        return plan;
    }
    async create(user, data) {
        const plan = this.repo.create({
            ...data,
            createdBy: user.id,
        });
        return this.repo.save(plan);
    }
    async update(id, clientId, data) {
        const plan = await this.findOne(id, clientId);
        Object.assign(plan, data);
        return this.repo.save(plan);
    }
    async delete(id, clientId) {
        const plan = await this.findOne(id, clientId);
        return this.repo.softRemove(plan);
    }
};
exports.ClientCorrectiveActionsService = ClientCorrectiveActionsService;
exports.ClientCorrectiveActionsService = ClientCorrectiveActionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(corrective_action_plan_entity_1.CorrectiveActionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientCorrectiveActionsService);
//# sourceMappingURL=corrective-actions.service.js.map
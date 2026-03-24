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
var AuditorScopeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorScopeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const line_item_response_entity_1 = require("../../database/entities/line-item-response.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
let AuditorScopeService = AuditorScopeService_1 = class AuditorScopeService {
    constructor(lineItemRepo, responseRepo, auditBURepo) {
        this.lineItemRepo = lineItemRepo;
        this.responseRepo = responseRepo;
        this.auditBURepo = auditBURepo;
        this.logger = new common_1.Logger(AuditorScopeService_1.name);
    }
    async getScope(auditId, user) {
        const bus = await this.auditBURepo.find({
            where: { auditId },
            relations: ['businessUnit'],
        });
        const results = await Promise.all(bus.map(async (bu) => {
            const items = await this.lineItemRepo.find({
                where: {
                    auditId,
                    auditBusinessUnitId: bu.id,
                    assignments: { auditorId: user.id }
                },
                relations: ['responses', 'options'],
                order: { displayOrder: 'ASC' },
            });
            const itemsWithDrafts = items.map(item => {
                const ownResponse = item.responses.find(r => r.auditorId === user.id);
                return {
                    ...item,
                    ownResponse,
                };
            });
            return {
                id: bu.id,
                name: bu.businessUnit.name,
                items: itemsWithDrafts,
            };
        }));
        return results;
    }
    async updateResponse(auditId, liId, user, dto) {
        const lineItem = await this.lineItemRepo.findOne({
            where: { id: liId, auditId },
            relations: ['assignments'],
        });
        if (!lineItem)
            throw new common_1.NotFoundException('Line item not found in this audit');
        const isAssigned = lineItem.assignments.some(a => a.auditorId === user.id);
        if (!isAssigned)
            throw new common_1.ForbiddenException('You are not assigned to this line item');
        if (lineItem.status === audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED || lineItem.status === audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED) {
            throw new common_1.BadRequestException('Line item is already submitted and locked');
        }
        let response = await this.responseRepo.findOne({
            where: { auditScopeLineItemId: liId, auditorId: user.id },
        });
        if (!response) {
            response = this.responseRepo.create({
                auditScopeLineItemId: liId,
                auditorId: user.id,
            });
        }
        response.responseText = dto.responseText;
        response.selectedOptionId = dto.selectedOptionId;
        response.comment = dto.comment;
        response.isDraft = dto.isDraft;
        await this.responseRepo.save(response);
        if (dto.isDraft) {
            lineItem.status = audit_scope_line_item_entity_1.LineItemStatus.DRAFT_SAVED;
        }
        else {
            if (lineItem.inputMethod === 'free_text' && (!dto.responseText || dto.responseText.length < 10)) {
                throw new common_1.BadRequestException('Response text must be at least 10 characters');
            }
            if (lineItem.inputMethod === 'multiple_choice' && !dto.selectedOptionId) {
                throw new common_1.BadRequestException('An option must be selected');
            }
            lineItem.status = audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED;
        }
        await this.lineItemRepo.save(lineItem);
        return response;
    }
};
exports.AuditorScopeService = AuditorScopeService;
exports.AuditorScopeService = AuditorScopeService = AuditorScopeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(1, (0, typeorm_1.InjectRepository)(line_item_response_entity_1.LineItemResponse)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuditorScopeService);
//# sourceMappingURL=scope.service.js.map
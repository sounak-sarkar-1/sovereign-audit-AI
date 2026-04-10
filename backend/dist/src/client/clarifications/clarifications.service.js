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
var ClientClarificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientClarificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const clarification_request_entity_1 = require("../../database/entities/clarification-request.entity");
const clarification_response_entity_1 = require("../../database/entities/clarification-response.entity");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
let ClientClarificationsService = ClientClarificationsService_1 = class ClientClarificationsService {
    constructor(clarificationRepo, responseRepo, fileRepo, notificationsService) {
        this.clarificationRepo = clarificationRepo;
        this.responseRepo = responseRepo;
        this.fileRepo = fileRepo;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(ClientClarificationsService_1.name);
    }
    async findAll(clientId, status) {
        const query = this.clarificationRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.audit', 'audit')
            .leftJoinAndSelect('c.manager', 'manager')
            .where('c.clientId = :clientId', { clientId });
        if (status) {
            query.andWhere('c.status = :status', { status });
        }
        return query.orderBy('c.createdAt', 'DESC').getMany();
    }
    async findOne(id, clientId) {
        const thread = await this.clarificationRepo.findOne({
            where: { id, clientId },
            relations: ['audit', 'manager', 'responses', 'responses.responder'],
        });
        if (!thread) {
            throw new common_1.NotFoundException('Clarification thread not found');
        }
        return thread;
    }
    async respond(id, clientId, message, attachmentFileIds) {
        const thread = await this.clarificationRepo.findOne({
            where: { id, clientId },
            relations: ['audit'],
        });
        if (!thread) {
            throw new common_1.NotFoundException('Clarification thread not found');
        }
        if (thread.status === clarification_request_entity_1.ClarificationStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot reply to a closed thread');
        }
        const response = this.responseRepo.create({
            clarificationRequestId: id,
            respondedBy: clientId,
            message,
        });
        await this.responseRepo.save(response);
        if (attachmentFileIds?.length) {
            await this.fileRepo.update({ id: (0, typeorm_2.In)(attachmentFileIds) }, { entityId: response.id });
        }
        thread.status = clarification_request_entity_1.ClarificationStatus.PENDING;
        await this.clarificationRepo.save(thread);
        await this.notificationsService.create({
            userId: thread.managerId,
            type: notification_entity_1.NotificationType.CLARIFICATION_REQUEST,
            title: 'Client replied to a clarification',
            message: `Client has responded to your clarification on audit "${thread.audit?.name}"`,
            relatedEntityType: 'ClarificationRequest',
            relatedEntityId: id,
            metadata: { auditId: thread.auditId },
        });
        return response;
    }
};
exports.ClientClarificationsService = ClientClarificationsService;
exports.ClientClarificationsService = ClientClarificationsService = ClientClarificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(clarification_request_entity_1.ClarificationRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(clarification_response_entity_1.ClarificationResponse)),
    __param(2, (0, typeorm_1.InjectRepository)(uploaded_file_entity_1.UploadedFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], ClientClarificationsService);
//# sourceMappingURL=clarifications.service.js.map
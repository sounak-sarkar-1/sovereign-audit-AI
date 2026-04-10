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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../database/entities/notification.entity");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async create(dto) {
        const notification = this.repository.create(dto);
        return await this.repository.save(notification);
    }
    async findAllForUser(userId, query) {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', isRead } = query;
        const skip = (page - 1) * limit;
        const targetUserId = typeof userId === 'object' ? userId.id : userId;
        const where = { userId: targetUserId };
        if (isRead !== undefined) {
            where.isRead = isRead;
        }
        const sortProperty = sortBy === 'created_at' ? 'createdAt' : sortBy;
        const [data, total] = await this.repository.findAndCount({
            where,
            order: { [sortProperty]: sortOrder },
            take: limit,
            skip,
        });
        const unreadCount = await this.repository.count({
            where: { userId: targetUserId, isRead: false },
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async markAsRead(id, userId) {
        await this.repository.update({ id, userId }, { isRead: true });
    }
    async markAllAsRead(userId) {
        const result = await this.repository.update({ userId, isRead: false }, { isRead: true });
        return result.affected || 0;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
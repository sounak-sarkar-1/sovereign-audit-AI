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
exports.DevController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./database/entities/user.entity");
const bcrypt = require("bcrypt");
let DevController = class DevController {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async setupAdmin() {
        const adminEmail = 'admin@sovereign.ai';
        const adminPassword = 'Password123!';
        let user = await this.userRepository.findOne({ where: { email: adminEmail } });
        if (!user) {
            user = this.userRepository.create({
                email: adminEmail,
                fullName: 'Admin User',
                role: user_entity_1.UserRole.ADMIN,
                passwordHash: await bcrypt.hash(adminPassword, 12),
                isFirstLogin: false,
            });
            await this.userRepository.save(user);
            return { message: 'Admin created', email: adminEmail, password: adminPassword };
        }
        return { message: 'Admin already exists', email: adminEmail };
    }
};
exports.DevController = DevController;
__decorate([
    (0, common_1.Get)('setup-admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevController.prototype, "setupAdmin", null);
exports.DevController = DevController = __decorate([
    (0, common_1.Controller)('dev'),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DevController);
//# sourceMappingURL=dev.controller.js.map
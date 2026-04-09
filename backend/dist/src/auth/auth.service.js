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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const users_service_1 = require("../admin/users/users.service");
const user_entity_1 = require("../database/entities/user.entity");
const refresh_token_entity_1 = require("../database/entities/refresh-token.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService, configService, userRepository, refreshTokenRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        console.log(`Login attempt for email: ${loginDto.email}`);
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            console.log(`User not found: ${loginDto.email}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        console.log(`User found: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
        if (user.status === 'inactive') {
            console.log(`User account is inactive: ${user.email}`);
            throw new common_1.ForbiddenException('Account is inactive');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        console.log(`Password valid: ${isPasswordValid}`);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
            },
        };
    }
    async refresh(token) {
        const tokenHash = this.hashToken(token);
        const refreshTokenRecord = await this.refreshTokenRepository.findOne({
            where: { tokenHash, revokedAt: null },
            relations: ['user'],
        });
        if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = refreshTokenRecord.user;
        refreshTokenRecord.revokedAt = new Date();
        await this.refreshTokenRepository.save(refreshTokenRecord);
        const accessToken = this.generateAccessToken(user);
        const newRefreshToken = await this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(token) {
        const tokenHash = this.hashToken(token);
        const refreshTokenRecord = await this.refreshTokenRepository.findOne({
            where: { tokenHash },
        });
        if (refreshTokenRecord) {
            refreshTokenRecord.revokedAt = new Date();
            await this.refreshTokenRepository.save(refreshTokenRecord);
        }
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            throw new common_1.UnauthorizedException('Current password incorrect');
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(changePasswordDto.newPassword)) {
            throw new common_1.BadRequestException('New password fails policy validation');
        }
        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
        user.isFirstLogin = false;
        await this.userRepository.save(user);
    }
    generateAccessToken(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }
    async generateRefreshToken(userId) {
        const token = crypto.randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresInDays = parseInt(this.configService.get('refreshToken.expiresIn') || '7', 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        const refreshToken = this.refreshTokenRepository.create({
            userId,
            tokenHash,
            expiresAt,
        });
        await this.refreshTokenRepository.save(refreshToken);
        return token;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [users_service_1.AdminUsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map
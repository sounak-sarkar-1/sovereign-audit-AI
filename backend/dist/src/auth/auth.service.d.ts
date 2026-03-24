import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AdminUsersService } from '../admin/users/users.service';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly logger;
    constructor(usersService: AdminUsersService, jwtService: JwtService, configService: ConfigService, userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            fullName: string;
            role: import("../database/entities/user.entity").UserRole;
            isFirstLogin: boolean;
        };
    }>;
    refresh(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(token: string): Promise<void>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    private generateAccessToken;
    private generateRefreshToken;
    private hashToken;
}

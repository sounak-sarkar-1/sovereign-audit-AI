import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminUsersService } from '../admin/users/users.service';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: AdminUsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginDto) {
    this.logger.log('Login attempt received');
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(`Failed login attempt for email: [REDACTED]`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'inactive') {
      this.logger.warn(`Failed login attempt for email: [REDACTED]`);
      throw new ForbiddenException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: [REDACTED]`);
      throw new UnauthorizedException('Invalid credentials');
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

  async refresh(token: string) {
    const tokenHash = this.hashToken(token);
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: null },
      relations: ['user'],
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
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

  async logout(token: string) {
    const tokenHash = this.hashToken(token);
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (refreshTokenRecord) {
      refreshTokenRecord.revokedAt = new Date();
      await this.refreshTokenRepository.save(refreshTokenRecord);
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password incorrect');
    }

    // Policy validation (at least 8 chars, 1 upper, 1 number, 1 special)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(changePasswordDto.newPassword)) {
      throw new BadRequestException('New password fails policy validation');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
    user.isFirstLogin = false;
    await this.userRepository.save(user);
  }

  private generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresInDays = parseInt(
      this.configService.get('refreshToken.expiresIn') || '7',
      10,
    );
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

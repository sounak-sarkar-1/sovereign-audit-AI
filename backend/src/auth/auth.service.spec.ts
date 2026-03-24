import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminUsersService } from '../admin/users/users.service';
import { User, UserStatus, UserRole } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: AdminUsersService;
  let jwtService: JwtService;
  let userRepository: any;
  let refreshTokenRepository: any;

  const mockUser: User = {
    id: 'user-uuid',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    fullName: 'Test User',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    isFirstLogin: false,
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminUsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('accessToken'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('7'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue({}),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<AdminUsersService>(AdminUsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  describe('login', () => {
    it('should return tokens and user info on valid credentials', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.fullName).toBe(mockUser.fullName);
    });

    it('should throw UnauthorizedException on invalid email', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@example.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for inactive users', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, status: UserStatus.INACTIVE });

      await expect(service.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password and clear isFirstLogin', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ ...mockUser, isFirstLogin: true });
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newHashedPassword'));

      await service.changePassword('user-uuid', {
        currentPassword: 'oldPassword',
        newPassword: 'NewPassword123!',
      });

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        isFirstLogin: false,
        passwordHash: 'newHashedPassword',
      }));
    });

    it('should throw BadRequestException on weak password', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      await expect(service.changePassword('user-uuid', {
        currentPassword: 'oldPassword',
        newPassword: 'weak',
      })).rejects.toThrow(BadRequestException);
    });
  });
});

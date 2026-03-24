import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            user: {
                id: string;
                fullName: string;
                role: import("../database/entities/user.entity").UserRole;
                isFirstLogin: boolean;
            };
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        data: {
            accessToken: string;
        };
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private setRefreshTokenCookie;
}

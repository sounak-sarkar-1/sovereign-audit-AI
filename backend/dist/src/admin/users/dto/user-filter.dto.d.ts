import { UserRole, UserStatus } from '../../../database/entities/user.entity';
export declare class UserFilterDto {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
}

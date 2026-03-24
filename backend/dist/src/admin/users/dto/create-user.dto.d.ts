import { UserRole } from '../../../database/entities/user.entity';
export declare class CreateUserDto {
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    defaultPassword?: string;
}

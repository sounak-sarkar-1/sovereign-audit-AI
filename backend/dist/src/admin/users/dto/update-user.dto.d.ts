import { UserStatus } from '../../../database/entities/user.entity';
export declare class UpdateUserDto {
    fullName?: string;
    phone?: string;
    status?: UserStatus;
}

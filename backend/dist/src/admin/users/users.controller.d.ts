import { AdminUsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, UserStatus } from '../../database/entities/user.entity';
export declare class AdminUsersController {
    private readonly service;
    constructor(service: AdminUsersService);
    create(createDto: CreateUserDto, req: any): Promise<import("../../database/entities/user.entity").User>;
    findAll(page?: number, limit?: number, role?: UserRole, status?: UserStatus, search?: string): Promise<{
        data: import("../../database/entities/user.entity").User[];
        meta: any;
    }>;
    findOne(id: string): Promise<import("../../database/entities/user.entity").User>;
    update(id: string, updateDto: UpdateUserDto, req: any): Promise<import("../../database/entities/user.entity").User>;
    remove(id: string, req: any, force?: string): Promise<void>;
}

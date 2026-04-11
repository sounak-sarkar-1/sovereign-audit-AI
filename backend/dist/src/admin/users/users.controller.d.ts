import { AdminUsersService } from './users.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class AdminUsersController {
    private readonly service;
    constructor(service: AdminUsersService);
    create(createDto: CreateUserDto, req: any): Promise<import("../../database/entities/user.entity").User>;
    findAll(query: UserFilterDto): Promise<{
        data: import("../../database/entities/user.entity").User[];
        meta: any;
    }>;
    findOne(id: string): Promise<import("../../database/entities/user.entity").User>;
    update(id: string, updateDto: UpdateUserDto, req: any): Promise<import("../../database/entities/user.entity").User>;
    remove(id: string, req: any, force?: string): Promise<void>;
}

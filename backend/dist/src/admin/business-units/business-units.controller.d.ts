import { AdminBusinessUnitsService } from './business-units.service';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';
export declare class AdminBusinessUnitsController {
    private readonly service;
    constructor(service: AdminBusinessUnitsService);
    create(clientId: string, dto: CreateBusinessUnitDto, req: any): Promise<import("../../database/entities/business-unit.entity").BusinessUnit>;
    findAll(clientId: string): Promise<import("../../database/entities/business-unit.entity").BusinessUnit[]>;
    update(clientId: string, buId: string, dto: UpdateBusinessUnitDto, req: any): Promise<import("../../database/entities/business-unit.entity").BusinessUnit>;
    remove(clientId: string, buId: string, req: any): Promise<void>;
}

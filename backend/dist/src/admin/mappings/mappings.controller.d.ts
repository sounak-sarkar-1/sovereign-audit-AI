import { AdminMappingsService } from './mappings.service';
import { CreateMappingDto } from './dto/create-mapping.dto';
export declare class AdminMappingsController {
    private readonly service;
    constructor(service: AdminMappingsService);
    addManagerAuditor(dto: CreateMappingDto, req: any): Promise<void>;
    removeManagerAuditor(managerId: string, auditorId: string, req: any): Promise<void>;
    addManagerClient(dto: CreateMappingDto, req: any): Promise<void>;
    removeManagerClient(managerId: string, clientId: string, req: any): Promise<void>;
}

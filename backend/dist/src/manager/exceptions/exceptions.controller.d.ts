import { ManagerExceptionsService } from './exceptions.service';
import { ApproveExceptionDto, RejectExceptionDto } from './dto/exception-action.dto';
import { User } from '../../database/entities/user.entity';
import { ExceptionStatus } from '../../database/entities/exception-request.entity';
export declare class ManagerExceptionsController {
    private readonly service;
    constructor(service: ManagerExceptionsService);
    findAll(auditId: string, status?: ExceptionStatus, manager?: User): Promise<import("../../database/entities/exception-request.entity").ExceptionRequest[]>;
    approve(exId: string, dto: ApproveExceptionDto, manager: User): Promise<{
        message: string;
    }>;
    reject(exId: string, dto: RejectExceptionDto, manager: User): Promise<{
        message: string;
    }>;
}

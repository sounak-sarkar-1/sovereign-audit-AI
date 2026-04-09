import { AuditorAuditsService } from './audits.service';
import { AuditorScopeService } from '../scope/scope.service';
import { AuditorExceptionsService } from '../exceptions/exceptions.service';
import { UpdateResponseDto } from '../scope/dto/update-response.dto';
import { CreateExceptionDto } from '../exceptions/dto/create-exception.dto';
import { User } from '../../database/entities/user.entity';
export declare class AuditorAuditsController {
    private readonly service;
    private readonly scopeService;
    private readonly exceptionsService;
    constructor(service: AuditorAuditsService, scopeService: AuditorScopeService, exceptionsService: AuditorExceptionsService);
    findAll(user: User): Promise<{
        endDate: Date;
        stats: {
            totalItems: number;
            submittedItems: number;
            draftItems: number;
            pendingExceptions: number;
            completionPercent: number;
        };
        id: string;
        name: string;
        clientId: string;
        client: User;
        managerId: string;
        manager: User;
        status: import("../../database/entities/audit.entity").AuditStatus;
        description: string;
        startDate: Date;
        expectedCompletionDate: Date;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }[]>;
    findOne(id: string, user: User): Promise<{
        clientName: string;
        endDate: Date;
        stats: {
            totalItems: number;
            submittedItems: number;
            pendingExceptions: number;
            completionPercent: number;
            buStats: {
                id: string;
                name: string;
                coAuditorCompletion: number;
            }[];
        };
        id: string;
        name: string;
        clientId: string;
        client: User;
        managerId: string;
        manager: User;
        status: import("../../database/entities/audit.entity").AuditStatus;
        description: string;
        startDate: Date;
        expectedCompletionDate: Date;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    getScope(id: string, user: User): Promise<{
        id: string;
        name: string;
        items: {
            ownResponse: import("../../database/entities/line-item-response.entity").LineItemResponse;
            id: string;
            auditId: string;
            audit: import("../../database/entities/audit.entity").Audit;
            auditBusinessUnitId: string;
            auditBusinessUnit: import("../../database/entities/audit-business-unit.entity").AuditBusinessUnit;
            name: string;
            description: string;
            inputMethod: import("../../database/entities/audit-scope-line-item.entity").InputMethod;
            isOptional: boolean;
            displayOrder: number;
            source: import("../../database/entities/audit-scope-line-item.entity").LineItemSource;
            status: import("../../database/entities/audit-scope-line-item.entity").LineItemStatus;
            options: import("../../database/entities/audit-scope-line-item-option.entity").AuditScopeLineItemOption[];
            responses: import("../../database/entities/line-item-response.entity").LineItemResponse[];
            assignments: import("../../database/entities/auditor-line-item-assignment.entity").AuditorLineItemAssignment[];
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        }[];
    }[]>;
    updateResponse(id: string, liId: string, dto: UpdateResponseDto, user: User): Promise<import("../../database/entities/line-item-response.entity").LineItemResponse>;
    getExceptions(id: string, user: User): Promise<import("../../database/entities/exception-request.entity").ExceptionRequest[]>;
    createException(id: string, dto: CreateExceptionDto, user: User): Promise<import("../../database/entities/exception-request.entity").ExceptionRequest>;
    getScopeItemComments(liId: string): Promise<import("../../database/entities/line-item-comment.entity").LineItemComment[]>;
    addScopeItemComment(liId: string, content: string, user: User): Promise<import("../../database/entities/line-item-comment.entity").LineItemComment>;
}

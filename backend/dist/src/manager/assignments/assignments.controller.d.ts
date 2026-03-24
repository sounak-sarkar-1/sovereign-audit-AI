import { ManagerAssignmentsService } from './assignments.service';
import { AssignAuditorDto } from './dto/assign-auditor.dto';
import { AssignLineItemDto } from './dto/assign-line-item.dto';
export declare class ManagerAssignmentsController {
    private readonly service;
    constructor(service: ManagerAssignmentsService);
    getAssignments(auditId: string): Promise<{
        audit: import("../../database/entities/audit.entity").Audit;
        businessUnits: import("../../database/entities/audit-business-unit.entity").AuditBusinessUnit[];
        buAssignments: import("../../database/entities/auditor-audit-assignment.entity").AuditorAuditAssignment[];
        lineItems: {
            assignment: import("../../database/entities/auditor-line-item-assignment.entity").AuditorLineItemAssignment;
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
    }>;
    assignToBU(auditId: string, dto: AssignAuditorDto, managerId: string): Promise<import("../../database/entities/auditor-audit-assignment.entity").AuditorAuditAssignment>;
    unassignFromBU(auditId: string, assignmentId: string, managerId: string): Promise<void>;
    assignToLineItem(auditId: string, dto: AssignLineItemDto, managerId: string): Promise<import("../../database/entities/auditor-line-item-assignment.entity").AuditorLineItemAssignment>;
    unassignFromLineItem(auditId: string, assignmentId: string, managerId: string): Promise<void>;
}

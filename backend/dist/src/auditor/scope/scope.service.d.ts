import { Repository } from 'typeorm';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { LineItemResponse } from '../../database/entities/line-item-response.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { User } from '../../database/entities/user.entity';
import { UploadedFile } from '../../database/entities/uploaded-file.entity';
import { LineItemComment } from '../../database/entities/line-item-comment.entity';
import { UpdateResponseDto } from './dto/update-response.dto';
export declare class AuditorScopeService {
    private readonly lineItemRepo;
    private readonly responseRepo;
    private readonly auditBURepo;
    private readonly fileRepo;
    private readonly commentRepo;
    private readonly logger;
    constructor(lineItemRepo: Repository<AuditScopeLineItem>, responseRepo: Repository<LineItemResponse>, auditBURepo: Repository<AuditBusinessUnit>, fileRepo: Repository<UploadedFile>, commentRepo: Repository<LineItemComment>);
    getComments(liId: string): Promise<LineItemComment[]>;
    addComment(liId: string, user: User, content: string): Promise<LineItemComment>;
    getScope(auditId: string, user: User): Promise<{
        id: string;
        name: string;
        items: {
            ownResponse: LineItemResponse;
            id: string;
            auditId: string;
            audit: import("../../database/entities/audit.entity").Audit;
            auditBusinessUnitId: string;
            auditBusinessUnit: AuditBusinessUnit;
            name: string;
            description: string;
            inputMethod: import("../../database/entities/audit-scope-line-item.entity").InputMethod;
            isOptional: boolean;
            displayOrder: number;
            source: import("../../database/entities/audit-scope-line-item.entity").LineItemSource;
            status: LineItemStatus;
            options: import("../../database/entities/audit-scope-line-item-option.entity").AuditScopeLineItemOption[];
            responses: LineItemResponse[];
            assignments: import("../../database/entities/auditor-line-item-assignment.entity").AuditorLineItemAssignment[];
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        }[];
    }[]>;
    updateResponse(auditId: string, liId: string, user: User, dto: UpdateResponseDto): Promise<LineItemResponse>;
}

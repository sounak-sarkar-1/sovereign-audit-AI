import { User } from './user.entity';
import { Audit } from './audit.entity';
import { AuditBusinessUnit } from './audit-business-unit.entity';
export declare class AuditorAuditAssignment {
    id: string;
    auditId: string;
    audit: Audit;
    auditorId: string;
    auditor: User;
    auditBusinessUnitId: string;
    auditBusinessUnit: AuditBusinessUnit;
    createdAt: Date;
    deletedAt: Date;
}

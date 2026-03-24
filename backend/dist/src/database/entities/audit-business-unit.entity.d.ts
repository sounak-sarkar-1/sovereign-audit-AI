import { Audit } from './audit.entity';
import { BusinessUnit } from './business-unit.entity';
export declare class AuditBusinessUnit {
    id: string;
    auditId: string;
    audit: Audit;
    businessUnitId: string;
    businessUnit: BusinessUnit;
    createdAt: Date;
    deletedAt: Date;
}

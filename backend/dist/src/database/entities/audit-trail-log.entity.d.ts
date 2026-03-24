import { User } from './user.entity';
export declare class AuditTrailLog {
    id: string;
    actorUserId: string;
    actorUser: User;
    actorRole: string;
    actionType: string;
    entityType: string;
    entityId: string;
    payload: any;
    ipAddress: string;
    createdAt: Date;
}

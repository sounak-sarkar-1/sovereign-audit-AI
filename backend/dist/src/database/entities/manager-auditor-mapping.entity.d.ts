import { User } from './user.entity';
export declare class ManagerAuditorMapping {
    id: string;
    managerId: string;
    auditorId: string;
    manager: User;
    auditor: User;
    createdAt: Date;
    deletedAt: Date;
}

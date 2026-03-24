import { ManagerAuditorMapping } from './manager-auditor-mapping.entity';
import { ManagerClientMapping } from './manager-client-mapping.entity';
export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    AUDITOR = "auditor",
    CLIENT = "client"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    isFirstLogin: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    auditorMappings: ManagerAuditorMapping[];
    managedByMappings: ManagerAuditorMapping[];
    clientMappings: ManagerClientMapping[];
    managedClientsByMappings: ManagerClientMapping[];
}

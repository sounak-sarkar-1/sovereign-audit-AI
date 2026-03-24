import { User } from './user.entity';
export declare class ManagerClientMapping {
    id: string;
    managerId: string;
    clientId: string;
    manager: User;
    client: User;
    createdAt: Date;
    deletedAt: Date;
}

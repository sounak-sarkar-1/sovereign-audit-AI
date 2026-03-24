import { User } from './user.entity';
export declare class BusinessUnit {
    id: string;
    clientId: string;
    client: User;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

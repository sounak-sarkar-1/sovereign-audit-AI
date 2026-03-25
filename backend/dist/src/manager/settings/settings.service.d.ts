import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
export declare class ManagerSettingsService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    getSettings(managerId: string): Promise<{
        notifications: {
            email: boolean;
            inApp: boolean;
            summaryFrequency: string;
        };
        displayPreference: string;
    }>;
    updateSettings(managerId: string, data: any): Promise<any>;
}

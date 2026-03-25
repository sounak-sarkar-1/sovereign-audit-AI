import { ManagerSettingsService } from './settings.service';
export declare class ManagerSettingsController {
    private readonly service;
    constructor(service: ManagerSettingsService);
    getSettings(req: any): Promise<{
        notifications: {
            email: boolean;
            inApp: boolean;
            summaryFrequency: string;
        };
        displayPreference: string;
    }>;
    updateSettings(req: any, data: any): Promise<any>;
}

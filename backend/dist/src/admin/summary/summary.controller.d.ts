import { AdminSummaryService } from './summary.service';
export declare class AdminSummaryController {
    private readonly service;
    constructor(service: AdminSummaryService);
    getSummary(): Promise<{
        totalUsers: number;
        activeAudits: number;
        pendingRequests: number;
        systemHealth: string;
    }>;
}

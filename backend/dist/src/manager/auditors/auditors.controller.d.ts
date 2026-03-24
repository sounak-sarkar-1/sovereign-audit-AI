import { HeatmapService } from './heatmap.service';
export declare class ManagerAuditorsController {
    private readonly heatmapService;
    constructor(heatmapService: HeatmapService);
    getHeatmap(managerId: string, auditId?: string): Promise<{
        kpis: {
            openLineItems: number;
            completionPercent: number;
            activeEngagementsCount: number;
        };
        auditors: {
            id: string;
            fullName: string;
            email: string;
            activeEngagementsCount: number;
            openLineItems: number;
            completionPercent: number;
            breakdown: {
                auditId: string;
                auditName: string;
                businessUnits: {
                    id: string;
                    name: string;
                }[];
                openItems: number;
                totalItems: number;
                completionPercent: number;
            }[];
        }[];
    }>;
}

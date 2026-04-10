import { ClientInsightsService } from './insights.service';
export declare class ClientInsightsController {
    private readonly service;
    constructor(service: ClientInsightsService);
    getInsights(req: any): Promise<{
        data: {
            auditsCount: number;
            complianceTrend: any[];
            riskByBu: any[];
            recurringFindings: any[];
            complianceScore?: undefined;
            complianceDelta?: undefined;
        };
    } | {
        data: {
            auditsCount: number;
            complianceTrend: {
                auditId: string;
                name: string;
                date: Date;
                score: number;
            }[];
            riskByBu: {
                buName: any;
                rate: number;
            }[];
            complianceScore: number;
            complianceDelta: number;
            recurringFindings: any[];
        };
    }>;
}

import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
export declare class TenantMiddleware implements NestMiddleware {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    use(req: Request, _res: Response, next: NextFunction): Promise<void>;
}

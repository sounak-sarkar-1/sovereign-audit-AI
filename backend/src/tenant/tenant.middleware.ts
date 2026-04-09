import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * TenantMiddleware — extracts x-tenant-slug header and attaches it to the request.
 * Used for multi-tenant schema isolation.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const slug = req.headers['x-tenant-slug'] as string | undefined;
    const schema = slug ? slug : 'public';

    // Attach to request for legacy/guard support
    (req as any).tenantSlug = slug;
    (req as any).tenantSchema = schema;

    next();
  }
}

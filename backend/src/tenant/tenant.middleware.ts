import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * TenantMiddleware — runs on every request.
 * Reads the X-Tenant-Slug header, looks up the tenant in global.tenants,
 * and attaches both tenantSlug and tenantSchema to the request for downstream use.
 *
 * Note: The full existence check + auth enforcement is in TenantGuard.
 * This middleware sets the values early in the pipeline so they are available
 * in guards and services without re-querying.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const slug = req.headers['x-tenant-slug'] as string | undefined;

    if (slug) {
      // Attach early; TenantGuard will perform the full DB validation
      (req as any).tenantSlug = slug;
      (req as any).tenantSchema = `tenant_${slug}`;
    }

    next();
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * TenantGuard — validates the X-Tenant-Slug header, queries global.tenants to confirm
 * the tenant exists, and attaches tenantSchema to the request.
 * Applied second in the guard stack after JwtAuthGuard.
 *
 * NOTE: TenantMiddleware sets req.tenantSlug early in the pipeline; this guard
 * performs the DB existence check and sets req.tenantSchema for downstream use.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const slug = request.headers['x-tenant-slug'] as string | undefined;

    if (!slug) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        message: 'X-Tenant-Slug header is required',
      });
    }

    // Verify the tenant exists in global.tenants (soft-delete aware)
    const result = await this.dataSource.query(
      `SELECT id FROM "global"."tenants" WHERE slug = $1 AND deleted_at IS NULL LIMIT 1`,
      [slug],
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        message: `Tenant '${slug}' not found`,
      });
    }

    // Attach to request for downstream use
    request.tenantSlug = slug;
    request.tenantSchema = `tenant_${slug}`;

    return true;
  }
}

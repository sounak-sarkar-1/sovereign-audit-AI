import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @TenantSlug() decorator — extracts the resolved tenant slug from the request.
 * The slug is attached to req.tenantSlug by TenantMiddleware.
 */
export const TenantSlug = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantSlug as string;
  },
);

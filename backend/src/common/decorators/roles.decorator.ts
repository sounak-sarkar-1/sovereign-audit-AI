import { SetMetadata } from '@nestjs/common';

export type UserRole = 'admin' | 'manager' | 'auditor' | 'client';

export const ROLES_KEY = 'roles';

/**
 * @Roles('admin', 'manager') decorator — declares which roles are permitted to access a route.
 * Consumed by RolesGuard.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

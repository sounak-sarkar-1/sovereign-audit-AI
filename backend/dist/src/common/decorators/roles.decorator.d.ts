export type UserRole = 'admin' | 'manager' | 'auditor' | 'client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;

import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminUsersService } from '../../admin/users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: AdminUsersService);
    validate(payload: any): Promise<import("../../database/entities/user.entity").User>;
}
export {};

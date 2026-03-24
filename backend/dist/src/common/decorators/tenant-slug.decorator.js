"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSlug = void 0;
const common_1 = require("@nestjs/common");
exports.TenantSlug = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantSlug;
});
//# sourceMappingURL=tenant-slug.decorator.js.map
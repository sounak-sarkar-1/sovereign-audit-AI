"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessUnitDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_business_unit_dto_1 = require("./create-business-unit.dto");
class UpdateBusinessUnitDto extends (0, mapped_types_1.PartialType)(create_business_unit_dto_1.CreateBusinessUnitDto) {
}
exports.UpdateBusinessUnitDto = UpdateBusinessUnitDto;
//# sourceMappingURL=update-business-unit.dto.js.map
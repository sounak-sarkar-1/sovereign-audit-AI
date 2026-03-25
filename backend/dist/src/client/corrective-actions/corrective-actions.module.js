"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientCorrectiveActionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const corrective_actions_controller_1 = require("./corrective-actions.controller");
const corrective_actions_service_1 = require("./corrective-actions.service");
const corrective_action_plan_entity_1 = require("../../database/entities/corrective-action-plan.entity");
let ClientCorrectiveActionsModule = class ClientCorrectiveActionsModule {
};
exports.ClientCorrectiveActionsModule = ClientCorrectiveActionsModule;
exports.ClientCorrectiveActionsModule = ClientCorrectiveActionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([corrective_action_plan_entity_1.CorrectiveActionPlan])],
        controllers: [corrective_actions_controller_1.ClientCorrectiveActionsController],
        providers: [corrective_actions_service_1.ClientCorrectiveActionsService],
        exports: [corrective_actions_service_1.ClientCorrectiveActionsService],
    })
], ClientCorrectiveActionsModule);
//# sourceMappingURL=corrective-actions.module.js.map
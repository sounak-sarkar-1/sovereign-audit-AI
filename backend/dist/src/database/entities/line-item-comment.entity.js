"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineItemComment = void 0;
const typeorm_1 = require("typeorm");
const audit_scope_line_item_entity_1 = require("./audit-scope-line-item.entity");
const user_entity_1 = require("./user.entity");
let LineItemComment = class LineItemComment {
};
exports.LineItemComment = LineItemComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LineItemComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_item_id' }),
    __metadata("design:type", String)
], LineItemComment.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_entity_1.AuditScopeLineItem),
    (0, typeorm_1.JoinColumn)({ name: 'line_item_id' }),
    __metadata("design:type", audit_scope_line_item_entity_1.AuditScopeLineItem)
], LineItemComment.prototype, "lineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'author_id' }),
    __metadata("design:type", String)
], LineItemComment.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    __metadata("design:type", user_entity_1.User)
], LineItemComment.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], LineItemComment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LineItemComment.prototype, "createdAt", void 0);
exports.LineItemComment = LineItemComment = __decorate([
    (0, typeorm_1.Entity)('line_item_comments')
], LineItemComment);
//# sourceMappingURL=line-item-comment.entity.js.map
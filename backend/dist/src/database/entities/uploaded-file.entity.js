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
exports.UploadedFile = exports.FileEntityType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var FileEntityType;
(function (FileEntityType) {
    FileEntityType["LINE_ITEM_EVIDENCE"] = "line_item_evidence";
    FileEntityType["EXCEPTION_EVIDENCE"] = "exception_evidence";
    FileEntityType["SOP_DOCUMENT"] = "sop_document";
    FileEntityType["AUDIT_REPORT"] = "audit_report";
    FileEntityType["EXCEPTIONAL_ACTION_EVIDENCE"] = "exceptional_action_evidence";
    FileEntityType["CLARIFICATION_ATTACHMENT"] = "clarification_attachment";
})(FileEntityType || (exports.FileEntityType = FileEntityType = {}));
let UploadedFile = class UploadedFile {
};
exports.UploadedFile = UploadedFile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UploadedFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_filename', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], UploadedFile.prototype, "originalFilename", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stored_filename', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], UploadedFile.prototype, "storedFilename", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path', type: 'text' }),
    __metadata("design:type", String)
], UploadedFile.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], UploadedFile.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size_bytes', type: 'integer' }),
    __metadata("design:type", Number)
], UploadedFile.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'uuid' }),
    __metadata("design:type", String)
], UploadedFile.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'uploaded_by' }),
    __metadata("design:type", user_entity_1.User)
], UploadedFile.prototype, "uploader", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entity_type',
        type: 'enum',
        enum: FileEntityType,
    }),
    __metadata("design:type", String)
], UploadedFile.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', type: 'uuid' }),
    __metadata("design:type", String)
], UploadedFile.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UploadedFile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], UploadedFile.prototype, "deletedAt", void 0);
exports.UploadedFile = UploadedFile = __decorate([
    (0, typeorm_1.Entity)('uploaded_files')
], UploadedFile);
//# sourceMappingURL=uploaded-file.entity.js.map
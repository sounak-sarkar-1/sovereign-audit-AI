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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = require("fs");
const path = require("path");
const crypto_1 = require("crypto");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
let FilesService = FilesService_1 = class FilesService {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
        this.logger = new common_1.Logger(FilesService_1.name);
        this.uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            this.logger.log(`Creating upload directory at ${this.uploadDir}`);
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFromBuffer(buffer, originalname, mimetype, uploadedBy, entityType, entityId) {
        try {
            const ext = path.extname(originalname);
            const storedFilename = `${(0, crypto_1.randomUUID)()}${ext}`;
            const filePath = path.join(this.uploadDir, storedFilename);
            await fs.promises.writeFile(filePath, buffer);
            const uploadedFile = this.fileRepository.create({
                originalFilename: originalname,
                storedFilename: storedFilename,
                filePath: filePath,
                mimeType: mimetype,
                fileSizeBytes: buffer.length,
                uploadedBy: uploadedBy,
                entityType: entityType,
                entityId: entityId,
            });
            return await this.fileRepository.save(uploadedFile);
        }
        catch (error) {
            this.logger.error(`Buffer upload failed: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to upload buffer');
        }
    }
    async uploadFile(file, uploadedBy, entityType, entityId) {
        try {
            const ext = path.extname(file.originalname);
            const storedFilename = `${(0, crypto_1.randomUUID)()}${ext}`;
            const filePath = path.join(this.uploadDir, storedFilename);
            this.logger.log(`Saving file ${file.originalname} to ${filePath}`);
            await fs.promises.writeFile(filePath, file.buffer);
            const uploadedFile = this.fileRepository.create({
                originalFilename: file.originalname,
                storedFilename: storedFilename,
                filePath: filePath,
                mimeType: file.mimetype,
                fileSizeBytes: file.size,
                uploadedBy: uploadedBy,
                entityType: entityType,
                entityId: entityId,
            });
            return await this.fileRepository.save(uploadedFile);
        }
        catch (error) {
            this.logger.error(`File upload failed: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to upload file');
        }
    }
    async findOne(id) {
        const file = await this.fileRepository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async updateAnnotations(id, annotations) {
        const file = await this.findOne(id);
        file.annotations = annotations;
        return await this.fileRepository.save(file);
    }
    async deleteFile(id) {
        const file = await this.findOne(id);
        try {
            if (fs.existsSync(file.filePath)) {
                await fs.promises.unlink(file.filePath);
            }
            await this.fileRepository.softRemove(file);
        }
        catch (error) {
            this.logger.error(`File deletion failed: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to delete file');
        }
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(uploaded_file_entity_1.UploadedFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map
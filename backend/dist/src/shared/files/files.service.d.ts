import { Repository } from 'typeorm';
import { Response } from 'express';
import { UploadedFile, FileEntityType } from '../../database/entities/uploaded-file.entity';
export declare class FilesService {
    private readonly fileRepository;
    private readonly logger;
    private readonly uploadDir;
    constructor(fileRepository: Repository<UploadedFile>);
    uploadFromBuffer(buffer: Buffer, originalname: string, mimetype: string, uploadedBy: string, entityType: FileEntityType | string, entityId?: string): Promise<UploadedFile>;
    uploadFile(file: Express.Multer.File, uploadedBy: string, entityType: FileEntityType, entityId: string): Promise<UploadedFile>;
    findOne(id: string): Promise<UploadedFile>;
    updateAnnotations(id: string, annotations: any): Promise<UploadedFile>;
    deleteFile(id: string): Promise<void>;
    streamFile(file: UploadedFile, res: Response): void;
}

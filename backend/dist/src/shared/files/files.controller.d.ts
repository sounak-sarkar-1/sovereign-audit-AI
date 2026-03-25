import { FilesService } from './files.service';
import { User } from '../../database/entities/user.entity';
import { FileEntityType } from '../../database/entities/uploaded-file.entity';
export declare class FilesController {
    private readonly service;
    constructor(service: FilesService);
    uploadFile(file: Express.Multer.File, entityType: FileEntityType, entityId: string, user: User): Promise<import("../../database/entities/uploaded-file.entity").UploadedFile>;
    updateAnnotations(id: string, annotations: any): Promise<import("../../database/entities/uploaded-file.entity").UploadedFile>;
}

import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import {
  UploadedFile,
  FileEntityType,
} from '../../database/entities/uploaded-file.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(UploadedFile)
    private readonly fileRepository: Repository<UploadedFile>,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      this.logger.log(`Creating upload directory at ${this.uploadDir}`);
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFromBuffer(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    uploadedBy: string,
    entityType: FileEntityType | string,
    entityId?: string,
  ): Promise<UploadedFile> {
    try {
      const ext = path.extname(originalname);
      const storedFilename = `${randomUUID()}${ext}`;
      const filePath = path.join(this.uploadDir, storedFilename);

      await fs.promises.writeFile(filePath, buffer);

      const uploadedFile = this.fileRepository.create({
        originalFilename: originalname,
        storedFilename: storedFilename,
        filePath: filePath,
        mimeType: mimetype,
        fileSizeBytes: buffer.length,
        uploadedBy: uploadedBy,
        entityType: entityType as FileEntityType,
        entityId: entityId,
      });

      return await this.fileRepository.save(uploadedFile);
    } catch (error) {
      this.logger.error(`Buffer upload failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload buffer');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadedBy: string,
    entityType: FileEntityType,
    entityId: string,
  ): Promise<UploadedFile> {
    try {
      const ext = path.extname(file.originalname);
      const storedFilename = `${randomUUID()}${ext}`;
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
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async findOne(id: string): Promise<UploadedFile> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async updateAnnotations(id: string, annotations: any): Promise<UploadedFile> {
    const file = await this.findOne(id);
    file.annotations = annotations;
    return await this.fileRepository.save(file);
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.findOne(id);
    try {
      if (fs.existsSync(file.filePath)) {
        await fs.promises.unlink(file.filePath);
      }
      await this.fileRepository.softRemove(file);
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  streamFile(file: UploadedFile, res: Response) {
    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalFilename}"`,
      'Content-Length': file.fileSizeBytes,
    });

    const stream = fs.createReadStream(file.filePath);
    stream.pipe(res);
  }
}
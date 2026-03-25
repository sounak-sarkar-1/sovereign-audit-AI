import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum FileEntityType {
  LINE_ITEM_EVIDENCE = 'line_item_evidence',
  EXCEPTION_EVIDENCE = 'exception_evidence',
  SOP_DOCUMENT = 'sop_document',
  AUDIT_REPORT = 'audit_report',
  EXCEPTIONAL_ACTION_EVIDENCE = 'exceptional_action_evidence',
  CLARIFICATION_ATTACHMENT = 'clarification_attachment',
}

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 500 })
  originalFilename: string;

  @Column({ name: 'stored_filename', type: 'varchar', length: 500 })
  storedFilename: string;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size_bytes', type: 'integer' })
  fileSizeBytes: number;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: FileEntityType,
  })
  entityType: FileEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  annotations: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

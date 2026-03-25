import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Audit } from './audit.entity';
import { UploadedFile } from './uploaded-file.entity';

export enum ReportStatus {
  DRAFT = 'draft',
  SENT_FOR_CLIENT_REVIEW = 'sent_for_client_review',
  FINAL = 'final',
}

@Entity('audit_reports')
export class AuditReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id', type: 'uuid' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({ name: 'file_id', type: 'uuid', nullable: true })
  fileId: string;

  @ManyToOne(() => UploadedFile)
  @JoinColumn({ name: 'file_id' })
  file: UploadedFile;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @Column({ name: 'manager_notes', type: 'text', nullable: true })
  managerNotes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ClientReportFeedback, (feedback) => feedback.report)
  feedbacks: ClientReportFeedback[];
}

import { ClientReportFeedback } from './client-report-feedback.entity';

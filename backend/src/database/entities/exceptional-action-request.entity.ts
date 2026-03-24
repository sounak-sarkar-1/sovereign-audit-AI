import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Audit } from './audit.entity';
import { User } from './user.entity';
import { UploadedFile } from './uploaded-file.entity';

export enum ExceptionalActionType {
  DELETE = 'delete',
  REOPEN = 'reopen',
}

export enum ExceptionalRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('exceptional_action_requests')
export class ExceptionalActionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id', type: 'uuid' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({
    name: 'action_type',
    type: 'enum',
    enum: ExceptionalActionType,
  })
  actionType: ExceptionalActionType;

  @Column({ type: 'text' })
  justification: string;

  @Column({
    type: 'enum',
    enum: ExceptionalRequestStatus,
    default: ExceptionalRequestStatus.PENDING,
  })
  status: ExceptionalRequestStatus;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by' })
  resolver: User;

  @Column({ name: 'evidence_file_id', type: 'uuid', nullable: true })
  evidenceFileId: string;

  @ManyToOne(() => UploadedFile)
  @JoinColumn({ name: 'evidence_file_id' })
  evidenceFile: UploadedFile;

  @Column({ name: 'admin_comment', type: 'text', nullable: true })
  adminComment: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

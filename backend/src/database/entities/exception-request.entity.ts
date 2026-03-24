import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { User } from './user.entity';

export enum ExceptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('exception_requests')
export class ExceptionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_scope_line_item_id', type: 'uuid' })
  auditScopeLineItemId: string;

  @ManyToOne(() => AuditScopeLineItem)
  @JoinColumn({ name: 'audit_scope_line_item_id' })
  auditScopeLineItem: AuditScopeLineItem;

  @Column({ name: 'auditor_id', type: 'uuid' })
  auditorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @Column({ name: 'manager_id', type: 'uuid' })
  managerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Column({ type: 'text' })
  justification: string;

  @Column({
    type: 'enum',
    enum: ExceptionStatus,
    default: ExceptionStatus.PENDING,
  })
  status: ExceptionStatus;

  @Column({ name: 'manager_comment', type: 'text', nullable: true })
  managerComment: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date;
}

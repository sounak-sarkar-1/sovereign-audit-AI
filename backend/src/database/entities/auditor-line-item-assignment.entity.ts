import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';

@Entity('auditor_line_item_assignments')
export class AuditorLineItemAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_scope_line_item_id', type: 'uuid' })
  auditScopeLineItemId: string;

  @ManyToOne(() => AuditScopeLineItem, (lineItem) => lineItem.assignments)
  @JoinColumn({ name: 'audit_scope_line_item_id' })
  auditScopeLineItem: AuditScopeLineItem;

  @Column({ name: 'auditor_id', type: 'uuid' })
  auditorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

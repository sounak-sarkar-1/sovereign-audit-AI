import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { AuditScopeLineItemOption } from './audit-scope-line-item-option.entity';

@Entity('line_item_responses')
@Index(['auditScopeLineItemId', 'auditorId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class LineItemResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_scope_line_item_id', type: 'uuid' })
  auditScopeLineItemId: string;

  @ManyToOne(() => AuditScopeLineItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'audit_scope_line_item_id' })
  lineItem: AuditScopeLineItem;

  @Column({ name: 'auditor_id', type: 'uuid' })
  auditorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @Column({ name: 'response_text', type: 'text', nullable: true })
  responseText: string;

  @Column({ name: 'selected_option_id', type: 'uuid', nullable: true })
  selectedOptionId: string;

  @ManyToOne(() => AuditScopeLineItemOption, { nullable: true })
  @JoinColumn({ name: 'selected_option_id' })
  selectedOption: AuditScopeLineItemOption;

  @Column({ name: 'compliance_score', type: 'smallint', nullable: true })
  complianceScore: number | null;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'is_draft', type: 'boolean', default: true })
  isDraft: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

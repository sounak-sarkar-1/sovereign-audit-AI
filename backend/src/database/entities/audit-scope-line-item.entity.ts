import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Audit } from './audit.entity';
import { AuditBusinessUnit } from './audit-business-unit.entity';
import { AuditScopeLineItemOption } from './audit-scope-line-item-option.entity';
import { LineItemResponse } from './line-item-response.entity';
import { AuditorLineItemAssignment } from './auditor-line-item-assignment.entity';


export enum InputMethod {
  FREE_TEXT = 'free_text',
  MULTIPLE_CHOICE = 'multiple_choice',
}

export enum LineItemSource {
  MANUAL = 'manual',
  AI_EXTRACTED = 'ai_extracted',
  EXCEL_IMPORTED = 'excel_imported',
  TEMPLATE = 'template',
}

export enum LineItemStatus {
  NOT_STARTED = 'not_started',
  DRAFT_SAVED = 'draft_saved',
  SUBMITTED = 'submitted',
  EXCEPTION_PENDING = 'exception_pending',
  EXCEPTION_APPROVED = 'exception_approved',
  EXCEPTION_REJECTED = 'exception_rejected',
  RETURNED = 'returned',
}

@Entity('audit_scope_line_items')
export class AuditScopeLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id', type: 'uuid' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({ name: 'audit_business_unit_id', type: 'uuid' })
  auditBusinessUnitId: string;

  @ManyToOne(() => AuditBusinessUnit)
  @JoinColumn({ name: 'audit_business_unit_id' })
  auditBusinessUnit: AuditBusinessUnit;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'input_method',
    type: 'enum',
    enum: InputMethod,
  })
  inputMethod: InputMethod;

  @Column({ name: 'is_optional', type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @Column({
    type: 'enum',
    enum: LineItemSource,
    default: LineItemSource.MANUAL,
  })
  source: LineItemSource;

  @Column({
    type: 'enum',
    enum: LineItemStatus,
    default: LineItemStatus.NOT_STARTED,
  })
  status: LineItemStatus;

  @OneToMany(() => AuditScopeLineItemOption, (option) => option.lineItem, { cascade: true })
  options: AuditScopeLineItemOption[];

  @OneToMany(() => LineItemResponse, (response) => response.lineItem)
  responses: LineItemResponse[];

  @OneToMany(() => AuditorLineItemAssignment, (assignment) => assignment.auditScopeLineItem)
  assignments: AuditorLineItemAssignment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })

  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

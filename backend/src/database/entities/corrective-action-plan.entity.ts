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
import { Audit } from './audit.entity';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { User } from './user.entity';

export enum CorrectiveActionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
}

export enum CorrectiveActionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('corrective_action_plans')
export class CorrectiveActionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id', type: 'uuid' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({ name: 'line_item_id', type: 'uuid' })
  lineItemId: string;

  @ManyToOne(() => AuditScopeLineItem)
  @JoinColumn({ name: 'line_item_id' })
  lineItem: AuditScopeLineItem;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: CorrectiveActionStatus,
    default: CorrectiveActionStatus.PENDING,
  })
  status: CorrectiveActionStatus;

  @Column({
    type: 'enum',
    enum: CorrectiveActionPriority,
    default: CorrectiveActionPriority.MEDIUM,
  })
  priority: CorrectiveActionPriority;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @Column({ name: 'completion_date', type: 'timestamptz', nullable: true })
  completionDate: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

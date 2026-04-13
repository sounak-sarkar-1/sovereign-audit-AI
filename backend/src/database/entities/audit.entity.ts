import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { AuditBusinessUnit } from './audit-business-unit.entity';

export enum AuditStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  UNDER_MANAGER_REVIEW = 'under_manager_review',
  PENDING_CLIENT_REVIEW = 'pending_client_review',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  DELETED = 'deleted',
  ARCHIVED = 'archived',
}

@Entity('audits')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'manager_id', type: 'uuid' })
  managerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Column({
    type: 'enum',
    enum: AuditStatus,
    default: AuditStatus.DRAFT,
  })
  status: AuditStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({
    name: 'expected_completion_date',
    type: 'timestamptz',
    nullable: true,
  })
  expectedCompletionDate: Date;

  @Column({ name: 'previous_audit_id', type: 'uuid', nullable: true })
  previousAuditId: string | null;

  @ManyToOne(() => Audit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'previous_audit_id' })
  previousAudit?: Audit;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @OneToMany(() => AuditBusinessUnit, (abu) => abu.audit)
  businessUnits: AuditBusinessUnit[];
}

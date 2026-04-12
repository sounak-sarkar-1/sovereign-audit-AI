import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Audit } from './audit.entity';
import { AuditBusinessUnit } from './audit-business-unit.entity';

@Entity('auditor_audit_assignments')
export class AuditorAuditAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id', type: 'uuid' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({ name: 'auditor_id', type: 'uuid' })
  auditorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @Column({ name: 'audit_business_unit_id', type: 'uuid' })
  auditBusinessUnitId: string;

  @ManyToOne(() => AuditBusinessUnit)
  @JoinColumn({ name: 'audit_business_unit_id' })
  auditBusinessUnit: AuditBusinessUnit;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}

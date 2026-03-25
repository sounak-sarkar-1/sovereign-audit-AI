import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditReport } from './audit-report.entity';
import { User } from './user.entity';

export enum FeedbackStatus {
  ACCEPTED = 'accepted',
  REQUIRES_REVISION = 'requires_revision',
  NO_COMMENT = 'no_comment',
}

@Entity('client_report_feedbacks')
export class ClientReportFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_id', type: 'uuid' })
  reportId: string;

  @ManyToOne(() => AuditReport)
  @JoinColumn({ name: 'report_id' })
  report: AuditReport;

  @Column({ name: 'section_name' })
  sectionName: string;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.NO_COMMENT,
  })
  status: FeedbackStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

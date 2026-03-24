import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  USER_CREATED = 'user_created',
  AUDIT_ASSIGNED = 'audit_assigned',
  EXCEPTION_RAISED = 'exception_raised',
  EXCEPTION_APPROVED = 'exception_approved',
  EXCEPTION_REJECTED = 'exception_rejected',
  REPORT_READY_TO_GENERATE = 'report_ready_to_generate',
  REPORT_SENT_TO_CLIENT = 'report_sent_to_client',
  CLIENT_FEEDBACK_RECEIVED = 'client_feedback_received',
  CLARIFICATION_REQUEST = 'clarification_request',
  CLARIFICATION_RESPONDED = 'clarification_responded',
  EXCEPTIONAL_REQUEST_RAISED = 'exceptional_request_raised',
  EXCEPTIONAL_REQUEST_RESOLVED = 'exceptional_request_resolved',
  AUDIT_CLOSED = 'audit_closed',
  REPORT_READY = 'report_ready',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'related_entity_type', type: 'varchar', length: 100, nullable: true })
  relatedEntityType: string;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

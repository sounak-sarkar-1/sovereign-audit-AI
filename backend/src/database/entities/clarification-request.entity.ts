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
import { User } from './user.entity';
import { ExceptionRequest } from './exception-request.entity';
import { ClarificationResponse } from './clarification-response.entity';

export enum ClarificationStatus {
  PENDING = 'pending',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

@Entity('clarification_requests')
export class ClarificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id', type: 'uuid' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({ name: 'manager_id', type: 'uuid' })
  managerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ClarificationStatus,
    default: ClarificationStatus.PENDING,
  })
  status: ClarificationStatus;

  @Column({ name: 'related_exception_id', type: 'uuid', nullable: true })
  relatedExceptionId: string;

  @ManyToOne(() => ExceptionRequest)
  @JoinColumn({ name: 'related_exception_id' })
  relatedException: ExceptionRequest;

  @OneToMany(
    () => ClarificationResponse,
    (response) => response.clarificationRequest,
  )
  responses: ClarificationResponse[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

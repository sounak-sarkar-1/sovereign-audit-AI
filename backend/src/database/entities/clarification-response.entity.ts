import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClarificationRequest } from './clarification-request.entity';
import { User } from './user.entity';

@Entity('clarification_responses')
export class ClarificationResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clarification_request_id', type: 'uuid' })
  clarificationRequestId: string;

  @ManyToOne(() => ClarificationRequest)
  @JoinColumn({ name: 'clarification_request_id' })
  clarificationRequest: ClarificationRequest;

  @Column({ name: 'responded_by', type: 'uuid' })
  respondedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responded_by' })
  user: User;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

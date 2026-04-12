import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Audit } from './audit.entity';
import { User } from './user.entity';

@Entity('engagement_chat_messages')
export class EngagementChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'audit_id' })
  auditId: string;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('text')
  content: string;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

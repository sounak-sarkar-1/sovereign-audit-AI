import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { User } from './user.entity';

@Entity('line_item_comments')
export class LineItemComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'line_item_id' })
  lineItemId: string;

  @ManyToOne(() => AuditScopeLineItem)
  @JoinColumn({ name: 'line_item_id' })
  lineItem: AuditScopeLineItem;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('text')
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExceptionRequest } from './exception-request.entity';
import { User } from './user.entity';

@Entity('exception_comments')
export class ExceptionComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'exception_request_id', type: 'uuid' })
  exceptionRequestId: string;

  @ManyToOne(() => ExceptionRequest)
  @JoinColumn({ name: 'exception_request_id' })
  exceptionRequest: ExceptionRequest;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

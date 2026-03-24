import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';

@Entity('audit_scope_line_item_options')
export class AuditScopeLineItemOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'line_item_id', type: 'uuid' })
  lineItemId: string;

  @ManyToOne(() => AuditScopeLineItem, (lineItem) => lineItem.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'line_item_id' })
  lineItem: AuditScopeLineItem;

  @Column({ name: 'option_text', type: 'varchar', length: 500 })
  optionText: string;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

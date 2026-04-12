import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditTemplateLineItem } from './audit-template-line-item.entity';

@Entity('audit_template_line_item_options')
export class AuditTemplateOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'line_item_id', type: 'uuid' })
  lineItemId: string;

  @ManyToOne(() => AuditTemplateLineItem, (item) => item.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'line_item_id' })
  lineItem: AuditTemplateLineItem;

  @Column({ name: 'option_text', type: 'varchar', length: 500 })
  optionText: string;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

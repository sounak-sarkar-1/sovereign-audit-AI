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
import { AuditTemplate } from './audit-template.entity';
import { AuditTemplateOption } from './audit-template-option.entity';

export enum InputMethod {
  FREE_TEXT = 'free_text',
  MULTIPLE_CHOICE = 'multiple_choice',
}

@Entity('audit_template_line_items')
export class AuditTemplateLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ManyToOne(() => AuditTemplate, (template) => template.lineItems)
  @JoinColumn({ name: 'template_id' })
  template: AuditTemplate;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'input_method',
    type: 'enum',
    enum: InputMethod,
  })
  inputMethod: InputMethod;

  @Column({ name: 'is_optional', type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @OneToMany(() => AuditTemplateOption, (option) => option.lineItem, {
    cascade: true,
  })
  options: AuditTemplateOption[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

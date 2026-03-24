import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('manager_auditor_mappings')
@Unique(['managerId', 'auditorId'])
export class ManagerAuditorMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'manager_id', type: 'uuid' })
  managerId: string;

  @Column({ name: 'auditor_id', type: 'uuid' })
  auditorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}

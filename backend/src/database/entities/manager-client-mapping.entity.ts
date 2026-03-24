import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('manager_client_mappings')
@Unique(['managerId', 'clientId'])
export class ManagerClientMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'manager_id', type: 'uuid' })
  managerId: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}

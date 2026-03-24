import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ManagerAuditorMapping } from './manager-auditor-mapping.entity';
import { ManagerClientMapping } from './manager-client-mapping.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AUDITOR = 'auditor',
  CLIENT = 'client',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'is_first_login', default: true })
  isFirstLogin: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToMany(() => ManagerAuditorMapping, m => m.manager)
  auditorMappings: ManagerAuditorMapping[];

  @OneToMany(() => ManagerAuditorMapping, m => m.auditor)
  managedByMappings: ManagerAuditorMapping[];

  @OneToMany(() => ManagerClientMapping, m => m.manager)
  clientMappings: ManagerClientMapping[];

  @OneToMany(() => ManagerClientMapping, m => m.client)
  managedClientsByMappings: ManagerClientMapping[];
}

import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
export declare class AdminUsersService {
    private readonly repository;
    private readonly auditRepository;
    private readonly assignmentRepository;
    private readonly auditTrailService;
    private readonly notificationsService;
    private readonly logger;
    constructor(repository: Repository<User>, auditRepository: Repository<Audit>, assignmentRepository: Repository<AuditorAuditAssignment>, auditTrailService: AuditTrailService, notificationsService: NotificationsService);
    create(createDto: CreateUserDto, actor?: {
        id: string;
        role: string;
        ip?: string;
    }): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findAll(query: {
        page?: number;
        limit?: number;
        role?: UserRole;
        status?: UserStatus;
        search?: string;
    }): Promise<{
        data: User[];
        meta: any;
    }>;
    findOne(id: string): Promise<User>;
    update(id: string, updateDto: UpdateUserDto, actor?: {
        id: string;
        role: string;
        ip?: string;
    }): Promise<User>;
    remove(id: string, forceDelete?: boolean, actor?: {
        id: string;
        role: string;
        ip?: string;
    }): Promise<void>;
    private checkActiveAssignments;
}

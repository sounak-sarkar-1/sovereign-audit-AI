import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersController } from './users.controller';
import { AdminUsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';
import { NotificationsModule } from '../../shared/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Audit, AuditorAuditAssignment]),
    AuditTrailModule,
    NotificationsModule,
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}

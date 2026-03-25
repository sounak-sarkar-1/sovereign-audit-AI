import { AdminAuditTrailController } from '../../admin/audit-trail/audit-trail.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrailLog])],
  controllers: [AdminAuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}

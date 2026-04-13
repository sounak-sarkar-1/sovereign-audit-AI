import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviousAuditToAudits1744570030000
  implements MigrationInterface
{
  name = 'AddPreviousAuditToAudits1744570030000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audits ADD COLUMN previous_audit_id UUID DEFAULT NULL REFERENCES audits(id) ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audits DROP COLUMN previous_audit_id`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManagerNotesToAuditReports1744459742000
  implements MigrationInterface
{
  name = 'AddManagerNotesToAuditReports1744459742000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_reports ADD COLUMN IF NOT EXISTS manager_notes TEXT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_reports DROP COLUMN IF EXISTS manager_notes`,
    );
  }
}

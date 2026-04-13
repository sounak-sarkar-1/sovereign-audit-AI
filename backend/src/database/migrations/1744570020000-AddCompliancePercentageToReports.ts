import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompliancePercentageToReports1744570020000
  implements MigrationInterface
{
  name = 'AddCompliancePercentageToReports1744570020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_reports ADD COLUMN compliance_percentage DECIMAL(5,2) DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_reports DROP COLUMN compliance_percentage`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportReadyToNotificationType1711310000000 implements MigrationInterface {
  name = 'AddReportReadyToNotificationType1711310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'report_ready' to notification_type enum
    // PostgreSQL doesn't support adding values to enums inside a transaction easily in older versions,
    // but for TypeORM migrations we can use ALTER TYPE.
    await queryRunner.query(
      `ALTER TYPE "notification_type" ADD VALUE 'report_ready'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Removing a value from an enum is not supported in PostgreSQL.
    // We would have to recreate the type, which is risky.
    // So we leave it as is or do nothing.
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeightageToLineItems1744570000000 implements MigrationInterface {
  name = 'AddWeightageToLineItems1744570000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_scope_line_items ADD COLUMN weightage DECIMAL(5,2) DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_scope_line_items DROP COLUMN weightage`,
    );
  }
}

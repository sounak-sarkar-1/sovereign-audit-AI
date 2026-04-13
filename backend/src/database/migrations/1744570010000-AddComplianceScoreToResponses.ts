import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComplianceScoreToResponses1744570010000
  implements MigrationInterface
{
  name = 'AddComplianceScoreToResponses1744570010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE line_item_responses ADD COLUMN compliance_score SMALLINT DEFAULT NULL CHECK (compliance_score >= 1 AND compliance_score <= 5)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE line_item_responses DROP COLUMN compliance_score`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnotationsToUploadedFiles1712736000000 implements MigrationInterface {
  name = 'AddAnnotationsToUploadedFiles1712736000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "uploaded_files" ADD "annotations" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "uploaded_files" DROP COLUMN "annotations"`);
  }
}

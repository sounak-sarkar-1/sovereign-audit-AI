import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScopeImportSessions1711123456791 implements MigrationInterface {
  name = 'ScopeImportSessions1711123456791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "import_sessions" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "data" JSONB NOT NULL,
                "expires_at" TIMESTAMPTZ NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "import_sessions"`);
  }
}

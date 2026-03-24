import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGlobalTenants1700000000000 implements MigrationInterface {
  name = 'CreateGlobalTenants1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the global schema if it doesn't exist
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "global"`);

    // Create the tenants table in the global schema
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "global"."tenants" (
        "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
        "name"       VARCHAR     NOT NULL,
        "slug"       VARCHAR     NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_global_tenants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_global_tenants_slug" UNIQUE ("slug")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "global"."tenants"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "global" CASCADE`);
  }
}

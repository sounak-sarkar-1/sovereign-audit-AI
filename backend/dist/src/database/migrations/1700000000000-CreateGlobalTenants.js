"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGlobalTenants1700000000000 = void 0;
class CreateGlobalTenants1700000000000 {
    constructor() {
        this.name = 'CreateGlobalTenants1700000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "global"`);
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "global"."tenants"`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "global" CASCADE`);
    }
}
exports.CreateGlobalTenants1700000000000 = CreateGlobalTenants1700000000000;
//# sourceMappingURL=1700000000000-CreateGlobalTenants.js.map
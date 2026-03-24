import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLineItemResponses1711123456792 implements MigrationInterface {
    name = 'AddLineItemResponses1711123456792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "line_item_responses" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "audit_scope_line_item_id" UUID NOT NULL REFERENCES "audit_scope_line_items"("id") ON DELETE CASCADE,
                "auditor_id" UUID NOT NULL REFERENCES "users"("id"),
                "response_text" TEXT,
                "selected_option_id" UUID REFERENCES "audit_scope_line_item_options"("id"),
                "comment" TEXT,
                "is_draft" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMPTZ
            )
        `);
        
        // Ensure deleted_at exists if table was created by InitialSchema
        await queryRunner.query(`ALTER TABLE "line_item_responses" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ`);
        
        // Remove submitted_at if it exists
        await queryRunner.query(`ALTER TABLE "line_item_responses" DROP COLUMN IF EXISTS "submitted_at"`);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "idx_lir_li_aud" 
            ON "line_item_responses" ("audit_scope_line_item_id", "auditor_id") 
            WHERE "deleted_at" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_lir_li_aud"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "line_item_responses"`);
    }
}

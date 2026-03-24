"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLineItemResponses1711123456792 = void 0;
class AddLineItemResponses1711123456792 {
    constructor() {
        this.name = 'AddLineItemResponses1711123456792';
    }
    async up(queryRunner) {
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
        await queryRunner.query(`ALTER TABLE "line_item_responses" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ`);
        await queryRunner.query(`ALTER TABLE "line_item_responses" DROP COLUMN IF EXISTS "submitted_at"`);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "idx_lir_li_aud" 
            ON "line_item_responses" ("audit_scope_line_item_id", "auditor_id") 
            WHERE "deleted_at" IS NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_lir_li_aud"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "line_item_responses"`);
    }
}
exports.AddLineItemResponses1711123456792 = AddLineItemResponses1711123456792;
//# sourceMappingURL=1711123456792-AddLineItemResponses.js.map
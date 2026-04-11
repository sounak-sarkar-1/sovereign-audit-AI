"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteAwareUniqueIndexes1712830000000 = void 0;
class SoftDeleteAwareUniqueIndexes1712830000000 {
    constructor() {
        this.name = 'SoftDeleteAwareUniqueIndexes1712830000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "auditor_audit_assignments" DROP CONSTRAINT IF EXISTS "uq_aud_audit_bu"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_aud_audit_bu_active" ON "auditor_audit_assignments" ("auditor_id", "audit_business_unit_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "auditor_line_item_assignments" DROP CONSTRAINT IF EXISTS "uq_aud_li"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_aud_li_active" ON "auditor_line_item_assignments" ("audit_scope_line_item_id", "auditor_id") WHERE "deleted_at" IS NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "uq_aud_audit_bu_active"`);
        await queryRunner.query(`ALTER TABLE "auditor_audit_assignments" ADD CONSTRAINT "uq_aud_audit_bu" UNIQUE ("auditor_id", "audit_business_unit_id")`);
        await queryRunner.query(`DROP INDEX IF EXISTS "uq_aud_li_active"`);
        await queryRunner.query(`ALTER TABLE "auditor_line_item_assignments" ADD CONSTRAINT "uq_aud_li" UNIQUE ("audit_scope_line_item_id", "auditor_id")`);
    }
}
exports.SoftDeleteAwareUniqueIndexes1712830000000 = SoftDeleteAwareUniqueIndexes1712830000000;
//# sourceMappingURL=1712830000000-SoftDeleteAwareUniqueIndexes.js.map
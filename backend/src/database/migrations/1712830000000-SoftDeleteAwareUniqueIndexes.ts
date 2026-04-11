import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteAwareUniqueIndexes1712830000000 implements MigrationInterface {
  name = 'SoftDeleteAwareUniqueIndexes1712830000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Fix auditor_audit_assignments
    // Drop existing constraint
    await queryRunner.query(`ALTER TABLE "auditor_audit_assignments" DROP CONSTRAINT IF EXISTS "uq_aud_audit_bu"`);
    // Create partial unique index
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_aud_audit_bu_active" ON "auditor_audit_assignments" ("auditor_id", "audit_business_unit_id") WHERE "deleted_at" IS NULL`);

    // 2. Fix auditor_line_item_assignments
    // Drop existing constraint
    await queryRunner.query(`ALTER TABLE "auditor_line_item_assignments" DROP CONSTRAINT IF EXISTS "uq_aud_li"`);
    // Create partial unique index
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_aud_li_active" ON "auditor_line_item_assignments" ("audit_scope_line_item_id", "auditor_id") WHERE "deleted_at" IS NULL`);

    // Clean up any existing soft-deleted duplicates if they exist (though schema prevented them)
    // No action needed for cleanup as the constraint previously prevented duplicates.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Revert auditor_audit_assignments
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_aud_audit_bu_active"`);
    await queryRunner.query(`ALTER TABLE "auditor_audit_assignments" ADD CONSTRAINT "uq_aud_audit_bu" UNIQUE ("auditor_id", "audit_business_unit_id")`);

    // 2. Revert auditor_line_item_assignments
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_aud_li_active"`);
    await queryRunner.query(`ALTER TABLE "auditor_line_item_assignments" ADD CONSTRAINT "uq_aud_li" UNIQUE ("audit_scope_line_item_id", "auditor_id")`);
  }
}

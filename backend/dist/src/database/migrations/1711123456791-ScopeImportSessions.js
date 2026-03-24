"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeImportSessions1711123456791 = void 0;
class ScopeImportSessions1711123456791 {
    constructor() {
        this.name = 'ScopeImportSessions1711123456791';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "import_sessions" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "data" JSONB NOT NULL,
                "expires_at" TIMESTAMPTZ NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "import_sessions"`);
    }
}
exports.ScopeImportSessions1711123456791 = ScopeImportSessions1711123456791;
//# sourceMappingURL=1711123456791-ScopeImportSessions.js.map
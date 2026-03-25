"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLineItemComments1711123456795 = void 0;
class AddLineItemComments1711123456795 {
    constructor() {
        this.name = 'AddLineItemComments1711123456795';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "line_item_comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "line_item_id" uuid NOT NULL,
                "author_id" uuid NOT NULL,
                "content" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_line_item_comments" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "line_item_comments" 
            ADD CONSTRAINT "FK_line_item_comments_item" 
            FOREIGN KEY ("line_item_id") REFERENCES "audit_scope_line_items"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "line_item_comments" 
            ADD CONSTRAINT "FK_line_item_comments_author" 
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "line_item_comments" DROP CONSTRAINT "FK_line_item_comments_author"`);
        await queryRunner.query(`ALTER TABLE "line_item_comments" DROP CONSTRAINT "FK_line_item_comments_item"`);
        await queryRunner.query(`DROP TABLE "line_item_comments"`);
    }
}
exports.AddLineItemComments1711123456795 = AddLineItemComments1711123456795;
//# sourceMappingURL=1711123456795-AddLineItemComments.js.map
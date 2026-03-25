"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddExceptionComments1711123456793 = void 0;
const typeorm_1 = require("typeorm");
class AddExceptionComments1711123456793 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "exception_comments",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid",
                },
                {
                    name: "exception_request_id",
                    type: "uuid",
                    isNullable: false,
                },
                {
                    name: "author_id",
                    type: "uuid",
                    isNullable: false,
                },
                {
                    name: "content",
                    type: "text",
                    isNullable: false,
                },
                {
                    name: "created_at",
                    type: "timestamptz",
                    default: "now()",
                },
            ],
        }), true);
        await queryRunner.createForeignKey("exception_comments", new typeorm_1.TableForeignKey({
            columnNames: ["exception_request_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "exception_requests",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("exception_comments", new typeorm_1.TableForeignKey({
            columnNames: ["author_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable("exception_comments");
        if (table) {
            const foreignKeys = table.foreignKeys;
            for (const fk of foreignKeys) {
                await queryRunner.dropForeignKey("exception_comments", fk);
            }
        }
        await queryRunner.dropTable("exception_comments");
    }
}
exports.AddExceptionComments1711123456793 = AddExceptionComments1711123456793;
//# sourceMappingURL=1711123456793-AddExceptionComments.js.map
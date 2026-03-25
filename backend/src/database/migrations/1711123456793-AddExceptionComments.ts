import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddExceptionComments1711123456793 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
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
            }),
            true
        );

        await queryRunner.createForeignKey(
            "exception_comments",
            new TableForeignKey({
                columnNames: ["exception_request_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "exception_requests",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "exception_comments",
            new TableForeignKey({
                columnNames: ["author_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEngagementChat1711123456794 implements MigrationInterface {
    name = 'AddEngagementChat1711123456794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "engagement_chat_messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "audit_id" uuid NOT NULL,
                "author_id" uuid NOT NULL,
                "content" text NOT NULL,
                "is_read" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_engagement_chat_messages" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "engagement_chat_messages" 
            ADD CONSTRAINT "FK_engagement_chat_audit" 
            FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "engagement_chat_messages" 
            ADD CONSTRAINT "FK_engagement_chat_author" 
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "engagement_chat_messages" DROP CONSTRAINT "FK_engagement_chat_author"`);
        await queryRunner.query(`ALTER TABLE "engagement_chat_messages" DROP CONSTRAINT "FK_engagement_chat_audit"`);
        await queryRunner.query(`DROP TABLE "engagement_chat_messages"`);
    }
}

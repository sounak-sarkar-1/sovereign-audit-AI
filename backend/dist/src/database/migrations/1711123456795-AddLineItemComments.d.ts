import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddLineItemComments1711123456795 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

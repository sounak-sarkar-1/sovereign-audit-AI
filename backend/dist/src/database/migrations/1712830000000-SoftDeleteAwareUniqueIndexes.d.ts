import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class SoftDeleteAwareUniqueIndexes1712830000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

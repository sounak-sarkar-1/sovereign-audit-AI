import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class InitialTenantSchema1711123456790 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

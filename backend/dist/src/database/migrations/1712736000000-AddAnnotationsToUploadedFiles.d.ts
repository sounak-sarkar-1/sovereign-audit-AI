import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAnnotationsToUploadedFiles1712736000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

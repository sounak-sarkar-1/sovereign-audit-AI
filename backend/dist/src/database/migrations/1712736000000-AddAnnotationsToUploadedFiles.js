"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAnnotationsToUploadedFiles1712736000000 = void 0;
class AddAnnotationsToUploadedFiles1712736000000 {
    constructor() {
        this.name = 'AddAnnotationsToUploadedFiles1712736000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "uploaded_files" ADD "annotations" jsonb`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "uploaded_files" DROP COLUMN "annotations"`);
    }
}
exports.AddAnnotationsToUploadedFiles1712736000000 = AddAnnotationsToUploadedFiles1712736000000;
//# sourceMappingURL=1712736000000-AddAnnotationsToUploadedFiles.js.map
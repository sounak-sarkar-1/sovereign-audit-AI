"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddReportReadyToNotificationType1711310000000 = void 0;
class AddReportReadyToNotificationType1711310000000 {
    constructor() {
        this.name = 'AddReportReadyToNotificationType1711310000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "notification_type" ADD VALUE 'report_ready'`);
    }
    async down(queryRunner) {
    }
}
exports.AddReportReadyToNotificationType1711310000000 = AddReportReadyToNotificationType1711310000000;
//# sourceMappingURL=1711310000000-AddReportReadyToNotificationType.js.map
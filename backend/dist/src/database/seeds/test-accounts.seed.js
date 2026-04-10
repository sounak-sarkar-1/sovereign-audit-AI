"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
const audit_entity_1 = require("../entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../entities/audit-scope-line-item.entity");
const manager_auditor_mapping_entity_1 = require("../entities/manager-auditor-mapping.entity");
const manager_client_mapping_entity_1 = require("../entities/manager-client-mapping.entity");
const exception_request_entity_1 = require("../entities/exception-request.entity");
const clarification_request_entity_1 = require("../entities/clarification-request.entity");
const business_unit_entity_1 = require("../entities/business-unit.entity");
const audit_business_unit_entity_1 = require("../entities/audit-business-unit.entity");
const dotenv = require("dotenv");
const path_1 = require("path");
const fs = require("fs");
dotenv.config();
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [(0, path_1.join)(__dirname, '..', 'entities', '*.entity.{ts,js}')],
        synchronize: false,
        logging: true,
    });
    await dataSource.initialize();
    const manager = dataSource.manager;
    console.log('Seeding test data...');
    let tenant = await manager.findOne(tenant_entity_1.Tenant, { where: { slug: 'gt-bharat' } });
    if (!tenant) {
        tenant = manager.create(tenant_entity_1.Tenant, {
            name: 'GT Bharat',
            slug: 'gt-bharat',
        });
        await manager.save(tenant);
    }
    const passwordHash = await bcrypt.hash('TestPassword123!', 12);
    const usersToCreate = [
        { email: 'admin@test.com', fullName: 'Test Admin', role: user_entity_1.UserRole.ADMIN },
        { email: 'manager@test.com', fullName: 'Test Manager', role: user_entity_1.UserRole.MANAGER },
        { email: 'auditor@test.com', fullName: 'Test Auditor', role: user_entity_1.UserRole.AUDITOR },
        { email: 'client@test.com', fullName: 'Test Client', role: user_entity_1.UserRole.CLIENT },
    ];
    const userMap = {};
    for (const userData of usersToCreate) {
        let user = await manager.findOne(user_entity_1.User, { where: { email: userData.email } });
        if (!user) {
            user = manager.create(user_entity_1.User, {
                ...userData,
                passwordHash,
                status: user_entity_1.UserStatus.ACTIVE,
                isFirstLogin: false,
            });
            await manager.save(user);
        }
        else {
            user.passwordHash = passwordHash;
            user.isFirstLogin = false;
            user.status = user_entity_1.UserStatus.ACTIVE;
            await manager.save(user);
        }
        userMap[userData.role] = user;
    }
    const mappings = [
        { manager: userMap.manager, auditor: userMap.auditor },
        { manager: userMap.manager, client: userMap.client },
    ];
    for (const m of mappings) {
        if ('auditor' in m) {
            const existing = await manager.findOne(manager_auditor_mapping_entity_1.ManagerAuditorMapping, {
                where: { managerId: m.manager.id, auditorId: m.auditor.id }
            });
            if (!existing) {
                await manager.save(manager.create(manager_auditor_mapping_entity_1.ManagerAuditorMapping, { managerId: m.manager.id, auditorId: m.auditor.id }));
            }
        }
        else {
            const existing = await manager.findOne(manager_client_mapping_entity_1.ManagerClientMapping, {
                where: { managerId: m.manager.id, clientId: m.client.id }
            });
            if (!existing) {
                await manager.save(manager.create(manager_client_mapping_entity_1.ManagerClientMapping, { managerId: m.manager.id, clientId: m.client.id }));
            }
        }
    }
    let audit = await manager.findOne(audit_entity_1.Audit, { where: { name: 'UAT-TEST-AUDIT' } });
    if (!audit) {
        audit = manager.create(audit_entity_1.Audit, {
            name: 'UAT-TEST-AUDIT',
            status: audit_entity_1.AuditStatus.DRAFT,
            managerId: userMap.manager.id,
            clientId: userMap.client.id,
            description: 'System-seeded audit for E2E testing.',
            startDate: new Date(),
            expectedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        await manager.save(audit);
    }
    let bu = await manager.findOne(business_unit_entity_1.BusinessUnit, { where: { name: 'Core Operations' } });
    if (!bu) {
        bu = manager.create(business_unit_entity_1.BusinessUnit, {
            name: 'Core Operations',
            clientId: userMap.client.id
        });
        await manager.save(bu);
    }
    let auditBU = await manager.findOne(audit_business_unit_entity_1.AuditBusinessUnit, {
        where: { auditId: audit.id, businessUnitId: bu.id }
    });
    if (!auditBU) {
        auditBU = manager.create(audit_business_unit_entity_1.AuditBusinessUnit, { auditId: audit.id, businessUnitId: bu.id });
        await manager.save(auditBU);
    }
    const lineItems = [
        { name: 'Data Privacy Policy', method: audit_scope_line_item_entity_1.InputMethod.FREE_TEXT },
        { name: 'Access Control Logs', method: audit_scope_line_item_entity_1.InputMethod.FREE_TEXT },
        { name: 'Encryption Standards', method: audit_scope_line_item_entity_1.InputMethod.FREE_TEXT },
        { name: 'Backup Frequency', method: audit_scope_line_item_entity_1.InputMethod.MULTIPLE_CHOICE },
        { name: 'Incident Response Plan', method: audit_scope_line_item_entity_1.InputMethod.MULTIPLE_CHOICE },
    ];
    const createdItems = [];
    for (let i = 0; i < lineItems.length; i++) {
        let item = await manager.findOne(audit_scope_line_item_entity_1.AuditScopeLineItem, {
            where: { auditId: audit.id, name: lineItems[i].name }
        });
        if (!item) {
            item = manager.create(audit_scope_line_item_entity_1.AuditScopeLineItem, {
                auditId: audit.id,
                auditBusinessUnitId: auditBU.id,
                name: lineItems[i].name,
                description: `Description for ${lineItems[i].name}`,
                inputMethod: lineItems[i].method,
                source: audit_scope_line_item_entity_1.LineItemSource.MANUAL,
                status: audit_scope_line_item_entity_1.LineItemStatus.NOT_STARTED,
                displayOrder: i,
            });
            await manager.save(item);
        }
        createdItems.push(item);
    }
    const existingException = await manager.findOne(exception_request_entity_1.ExceptionRequest, {
        where: { auditScopeLineItemId: createdItems[0].id }
    });
    if (!existingException) {
        const exception = manager.create(exception_request_entity_1.ExceptionRequest, {
            auditScopeLineItemId: createdItems[0].id,
            auditorId: userMap.auditor.id,
            managerId: userMap.manager.id,
            justification: 'Critical business process prevents immediate compliance for this item.',
            status: exception_request_entity_1.ExceptionStatus.PENDING,
        });
        await manager.save(exception);
        createdItems[0].status = audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_PENDING;
        await manager.save(createdItems[0]);
    }
    const existingClarification = await manager.findOne(clarification_request_entity_1.ClarificationRequest, {
        where: { auditId: audit.id, managerId: userMap.manager.id, clientId: userMap.client.id }
    });
    if (!existingClarification) {
        const clarification = manager.create(clarification_request_entity_1.ClarificationRequest, {
            auditId: audit.id,
            managerId: userMap.manager.id,
            clientId: userMap.client.id,
            message: 'Please provide more details on the data retention policy for regional offices.',
            status: clarification_request_entity_1.ClarificationStatus.PENDING,
        });
        await manager.save(clarification);
    }
    fs.writeFileSync((0, path_1.join)(__dirname, '..', '..', '..', '..', 'e2e-env.json'), JSON.stringify({ TEST_AUDIT_ID: audit.id }));
    console.log(`Seeding complete. Test Audit ID: ${audit.id}`);
    await dataSource.destroy();
}
seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
//# sourceMappingURL=test-accounts.seed.js.map
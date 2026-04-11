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
const auditor_audit_assignment_entity_1 = require("../entities/auditor-audit-assignment.entity");
const exceptional_action_request_entity_1 = require("../entities/exceptional-action-request.entity");
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
        { email: 'manager1@test.com', fullName: 'Test Manager One', role: user_entity_1.UserRole.MANAGER },
        { email: 'manager2@test.com', fullName: 'Test Manager Two', role: user_entity_1.UserRole.MANAGER },
        { email: 'auditor1@test.com', fullName: 'Test Auditor One', role: user_entity_1.UserRole.AUDITOR },
        { email: 'auditor2@test.com', fullName: 'Test Auditor Two', role: user_entity_1.UserRole.AUDITOR },
        { email: 'auditor3@test.com', fullName: 'Test Auditor Three', role: user_entity_1.UserRole.AUDITOR },
        { email: 'client1@test.com', fullName: 'Test Client One', role: user_entity_1.UserRole.CLIENT },
        { email: 'client2@test.com', fullName: 'Test Client Two', role: user_entity_1.UserRole.CLIENT },
        { email: 'client3@test.com', fullName: 'Test Client Three', role: user_entity_1.UserRole.CLIENT },
        { email: 'client4@test.com', fullName: 'Test Client Four', role: user_entity_1.UserRole.CLIENT },
        { email: 'client5@test.com', fullName: 'Test Client Five', role: user_entity_1.UserRole.CLIENT },
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
            console.log(`Created user: ${userData.email}`);
        }
        else {
            user.fullName = userData.fullName;
            user.role = userData.role;
            user.passwordHash = passwordHash;
            user.isFirstLogin = false;
            user.status = user_entity_1.UserStatus.ACTIVE;
            await manager.save(user);
            console.log(`Updated user: ${userData.email}`);
        }
        userMap[userData.email] = user;
    }
    const managerAuditorMap = [
        { m: 'manager1@test.com', a: 'auditor1@test.com' },
        { m: 'manager1@test.com', a: 'auditor2@test.com' },
        { m: 'manager2@test.com', a: 'auditor3@test.com' },
    ];
    const managerClientMap = [
        { m: 'manager1@test.com', c: 'client1@test.com' },
        { m: 'manager1@test.com', c: 'client2@test.com' },
        { m: 'manager1@test.com', c: 'client3@test.com' },
        { m: 'manager2@test.com', c: 'client4@test.com' },
        { m: 'manager2@test.com', c: 'client5@test.com' },
    ];
    for (const mapping of managerAuditorMap) {
        const mgr = userMap[mapping.m];
        const aud = userMap[mapping.a];
        const existing = await manager.findOne(manager_auditor_mapping_entity_1.ManagerAuditorMapping, {
            where: { managerId: mgr.id, auditorId: aud.id },
            withDeleted: true,
        });
        if (!existing) {
            await manager.save(manager.create(manager_auditor_mapping_entity_1.ManagerAuditorMapping, { managerId: mgr.id, auditorId: aud.id }));
        }
        else if (existing.deletedAt) {
            existing.deletedAt = null;
            await manager.save(existing);
        }
    }
    for (const mapping of managerClientMap) {
        const mgr = userMap[mapping.m];
        const cli = userMap[mapping.c];
        const existing = await manager.findOne(manager_client_mapping_entity_1.ManagerClientMapping, {
            where: { managerId: mgr.id, clientId: cli.id },
            withDeleted: true,
        });
        if (!existing) {
            await manager.save(manager.create(manager_client_mapping_entity_1.ManagerClientMapping, { managerId: mgr.id, clientId: cli.id }));
        }
        else if (existing.deletedAt) {
            existing.deletedAt = null;
            await manager.save(existing);
        }
    }
    console.log('User mappings established.');
    const auditRequests = [
        { name: 'MANAGER-1-AUDIT-1', mgr: 'manager1@test.com', cli: 'client1@test.com' },
        { name: 'MANAGER-2-AUDIT-2', mgr: 'manager2@test.com', cli: 'client4@test.com' },
    ];
    const createdAudits = [];
    for (const req of auditRequests) {
        let audit = await manager.findOne(audit_entity_1.Audit, { where: { name: req.name } });
        if (!audit) {
            audit = manager.create(audit_entity_1.Audit, {
                name: req.name,
                status: audit_entity_1.AuditStatus.DRAFT,
                managerId: userMap[req.mgr].id,
                clientId: userMap[req.cli].id,
                description: `System-seeded audit for ${req.name}.`,
                startDate: new Date(),
                expectedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            await manager.save(audit);
            console.log(`Created audit: ${req.name}`);
        }
        createdAudits.push(audit);
    }
    const auditBUs = [];
    for (const audit of createdAudits) {
        let bu = await manager.findOne(business_unit_entity_1.BusinessUnit, { where: { name: 'Core Operations', clientId: audit.clientId } });
        if (!bu) {
            bu = manager.create(business_unit_entity_1.BusinessUnit, {
                name: 'Core Operations',
                clientId: audit.clientId
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
        auditBUs.push(auditBU);
    }
    const scopeItems = [];
    for (let i = 0; i < createdAudits.length; i++) {
        const audit = createdAudits[i];
        const auditBU = auditBUs[i];
        const itemName = `Policy Compliance Check - ${audit.name}`;
        let item = await manager.findOne(audit_scope_line_item_entity_1.AuditScopeLineItem, {
            where: { auditId: audit.id, name: itemName }
        });
        if (!item) {
            item = manager.create(audit_scope_line_item_entity_1.AuditScopeLineItem, {
                auditId: audit.id,
                auditBusinessUnitId: auditBU.id,
                name: itemName,
                description: `Verify that all departments comply with the standard policy for ${audit.name}.`,
                inputMethod: audit_scope_line_item_entity_1.InputMethod.FREE_TEXT,
                source: audit_scope_line_item_entity_1.LineItemSource.MANUAL,
                status: audit_scope_line_item_entity_1.LineItemStatus.NOT_STARTED,
                displayOrder: 0,
            });
            await manager.save(item);
        }
        scopeItems.push(item);
    }
    const auditAssignments = [
        { auditIndex: 0, aud: 'auditor1@test.com' },
        { auditIndex: 1, aud: 'auditor3@test.com' },
    ];
    for (const ass of auditAssignments) {
        const audit = createdAudits[ass.auditIndex];
        const auditor = userMap[ass.aud];
        const auditBU = auditBUs[ass.auditIndex];
        const existing = await manager.findOne(auditor_audit_assignment_entity_1.AuditorAuditAssignment, {
            where: { auditId: audit.id, auditorId: auditor.id }
        });
        if (!existing) {
            await manager.save(manager.create(auditor_audit_assignment_entity_1.AuditorAuditAssignment, {
                auditId: audit.id,
                auditorId: auditor.id,
                auditBusinessUnitId: auditBU.id
            }));
            console.log(`Assigned ${ass.aud} to audit ${audit.name}`);
        }
    }
    const audit1Item = scopeItems[0];
    const existingException = await manager.findOne(exception_request_entity_1.ExceptionRequest, {
        where: { auditScopeLineItemId: audit1Item.id }
    });
    if (!existingException) {
        await manager.save(manager.create(exception_request_entity_1.ExceptionRequest, {
            auditScopeLineItemId: audit1Item.id,
            auditorId: userMap['auditor1@test.com'].id,
            managerId: userMap['manager1@test.com'].id,
            justification: 'Critical business dependency prevents compliance during this specific audit cycle.',
            status: exception_request_entity_1.ExceptionStatus.PENDING,
        }));
        audit1Item.status = audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_PENDING;
        await manager.save(audit1Item);
        console.log('Created pending exception request for Audit 1');
    }
    const existingClarification = await manager.findOne(clarification_request_entity_1.ClarificationRequest, {
        where: { auditId: createdAudits[0].id, status: clarification_request_entity_1.ClarificationStatus.PENDING }
    });
    if (!existingClarification) {
        await manager.save(manager.create(clarification_request_entity_1.ClarificationRequest, {
            auditId: createdAudits[0].id,
            managerId: userMap['manager1@test.com'].id,
            clientId: userMap['client1@test.com'].id,
            message: 'Can you please provide the latest revision of the SOP document for reference?',
            status: clarification_request_entity_1.ClarificationStatus.PENDING,
        }));
        console.log('Created pending clarification thread for Audit 1');
    }
    const actionTypes = [exceptional_action_request_entity_1.ExceptionalActionType.REOPEN, exceptional_action_request_entity_1.ExceptionalActionType.DELETE];
    for (const actionType of actionTypes) {
        const audit = createdAudits[0];
        const mgr = userMap['manager1@test.com'];
        const justification = `Administrative test request for ${actionType}.`;
        let actionRequest = await manager.findOne(exceptional_action_request_entity_1.ExceptionalActionRequest, {
            where: { auditId: audit.id, actionType: actionType, requestedById: mgr.id }
        });
        if (!actionRequest) {
            await manager.save(manager.create(exceptional_action_request_entity_1.ExceptionalActionRequest, {
                auditId: audit.id,
                actionType: actionType,
                justification: justification,
                status: exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING,
                requestedById: mgr.id,
            }));
        }
        else {
            actionRequest.status = exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING;
            await manager.save(actionRequest);
        }
    }
    fs.writeFileSync((0, path_1.join)(__dirname, '..', '..', '..', '..', 'e2e-env.json'), JSON.stringify({ TEST_AUDIT_ID: createdAudits[0].id }));
    console.log(`Seeding complete. Primary Test Audit ID: ${createdAudits[0].id}`);
    await dataSource.destroy();
}
seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
//# sourceMappingURL=test-accounts.seed.js.map
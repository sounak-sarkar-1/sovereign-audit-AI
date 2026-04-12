import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { Audit, AuditStatus } from '../entities/audit.entity';
import {
  AuditScopeLineItem,
  InputMethod,
  LineItemSource,
  LineItemStatus,
} from '../entities/audit-scope-line-item.entity';
import { ManagerAuditorMapping } from '../entities/manager-auditor-mapping.entity';
import { ManagerClientMapping } from '../entities/manager-client-mapping.entity';
import {
  ExceptionRequest,
  ExceptionStatus,
} from '../entities/exception-request.entity';
import {
  ClarificationRequest,
  ClarificationStatus,
} from '../entities/clarification-request.entity';
import { BusinessUnit } from '../entities/business-unit.entity';
import { AuditBusinessUnit } from '../entities/audit-business-unit.entity';
import { AuditorAuditAssignment } from '../entities/auditor-audit-assignment.entity';
import {
  ExceptionalActionRequest,
  ExceptionalActionType,
  ExceptionalRequestStatus,
} from '../entities/exceptional-action-request.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config();

/**
 * SEED SCRIPT for Sovereign Audit AI
 * Creates a fixed set of test users, mappings, and audit data for E2E testing.
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  const manager = dataSource.manager;

  console.log('Seeding test data...');

  // 1. Ensure Tenant exists
  let tenant = await manager.findOne(Tenant, { where: { slug: 'gt-bharat' } });
  if (!tenant) {
    tenant = manager.create(Tenant, {
      name: 'GT Bharat',
      slug: 'gt-bharat',
    });
    await manager.save(tenant);
  }

  // 2. Create/Update Users (at least 11 users total)
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);

  const usersToCreate = [
    // Admin
    { email: 'admin@test.com', fullName: 'Test Admin', role: UserRole.ADMIN },
    // Managers
    {
      email: 'manager1@test.com',
      fullName: 'Test Manager One',
      role: UserRole.MANAGER,
    },
    {
      email: 'manager2@test.com',
      fullName: 'Test Manager Two',
      role: UserRole.MANAGER,
    },
    // Auditors
    {
      email: 'auditor1@test.com',
      fullName: 'Test Auditor One',
      role: UserRole.AUDITOR,
    },
    {
      email: 'auditor2@test.com',
      fullName: 'Test Auditor Two',
      role: UserRole.AUDITOR,
    },
    {
      email: 'auditor3@test.com',
      fullName: 'Test Auditor Three',
      role: UserRole.AUDITOR,
    },
    // Clients
    {
      email: 'client1@test.com',
      fullName: 'Test Client One',
      role: UserRole.CLIENT,
    },
    {
      email: 'client2@test.com',
      fullName: 'Test Client Two',
      role: UserRole.CLIENT,
    },
    {
      email: 'client3@test.com',
      fullName: 'Test Client Three',
      role: UserRole.CLIENT,
    },
    {
      email: 'client4@test.com',
      fullName: 'Test Client Four',
      role: UserRole.CLIENT,
    },
    {
      email: 'client5@test.com',
      fullName: 'Test Client Five',
      role: UserRole.CLIENT,
    },
  ];

  const userMap: Record<string, User> = {};

  for (const userData of usersToCreate) {
    let user = await manager.findOne(User, {
      where: { email: userData.email },
    });
    if (!user) {
      user = manager.create(User, {
        ...userData,
        passwordHash,
        status: UserStatus.ACTIVE,
        isFirstLogin: false,
      });
      await manager.save(user);
      console.log(`Created user: ${userData.email}`);
    } else {
      // Update existing user to match requirements
      user.fullName = userData.fullName;
      user.role = userData.role;
      user.passwordHash = passwordHash;
      user.isFirstLogin = false;
      user.status = UserStatus.ACTIVE;
      await manager.save(user);
      console.log(`Updated user: ${userData.email}`);
    }
    userMap[userData.email] = user;
  }

  // 3. Create Mappings
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
    const existing = await manager.findOne(ManagerAuditorMapping, {
      where: { managerId: mgr.id, auditorId: aud.id },
      withDeleted: true,
    });
    if (!existing) {
      await manager.save(
        manager.create(ManagerAuditorMapping, {
          managerId: mgr.id,
          auditorId: aud.id,
        }),
      );
    } else if (existing.deletedAt) {
      existing.deletedAt = null;
      await manager.save(existing);
    }
  }

  for (const mapping of managerClientMap) {
    const mgr = userMap[mapping.m];
    const cli = userMap[mapping.c];
    const existing = await manager.findOne(ManagerClientMapping, {
      where: { managerId: mgr.id, clientId: cli.id },
      withDeleted: true,
    });
    if (!existing) {
      await manager.save(
        manager.create(ManagerClientMapping, {
          managerId: mgr.id,
          clientId: cli.id,
        }),
      );
    } else if (existing.deletedAt) {
      existing.deletedAt = null;
      await manager.save(existing);
    }
  }

  console.log('User mappings established.');

  // 4. Create Audits
  const auditRequests = [
    {
      name: 'MANAGER-1-AUDIT-1',
      mgr: 'manager1@test.com',
      cli: 'client1@test.com',
    },
    {
      name: 'MANAGER-2-AUDIT-2',
      mgr: 'manager2@test.com',
      cli: 'client4@test.com',
    },
  ];

  const createdAudits: Audit[] = [];

  for (const req of auditRequests) {
    let audit = await manager.findOne(Audit, { where: { name: req.name } });
    if (!audit) {
      audit = manager.create(Audit, {
        name: req.name,
        status: AuditStatus.DRAFT,
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

  // 5. Create Business Units and Link to Audits
  const auditBUs: AuditBusinessUnit[] = [];
  for (const audit of createdAudits) {
    let bu = await manager.findOne(BusinessUnit, {
      where: { name: 'Core Operations', clientId: audit.clientId },
    });
    if (!bu) {
      bu = manager.create(BusinessUnit, {
        name: 'Core Operations',
        clientId: audit.clientId,
      });
      await manager.save(bu);
    }

    let auditBU = await manager.findOne(AuditBusinessUnit, {
      where: { auditId: audit.id, businessUnitId: bu.id },
    });
    if (!auditBU) {
      auditBU = manager.create(AuditBusinessUnit, {
        auditId: audit.id,
        businessUnitId: bu.id,
      });
      await manager.save(auditBU);
    }
    auditBUs.push(auditBU);
  }

  // 6. Create Scope Line Items
  const scopeItems: AuditScopeLineItem[] = [];
  for (let i = 0; i < createdAudits.length; i++) {
    const audit = createdAudits[i];
    const auditBU = auditBUs[i];
    const itemName = `Policy Compliance Check - ${audit.name}`;

    let item = await manager.findOne(AuditScopeLineItem, {
      where: { auditId: audit.id, name: itemName },
    });
    if (!item) {
      item = manager.create(AuditScopeLineItem, {
        auditId: audit.id,
        auditBusinessUnitId: auditBU.id,
        name: itemName,
        description: `Verify that all departments comply with the standard policy for ${audit.name}.`,
        inputMethod: InputMethod.FREE_TEXT,
        source: LineItemSource.MANUAL,
        status: LineItemStatus.NOT_STARTED,
        displayOrder: 0,
      });
      await manager.save(item);
    }
    scopeItems.push(item);
  }

  // 7. Assign Auditors
  const auditAssignments = [
    { auditIndex: 0, aud: 'auditor1@test.com' },
    { auditIndex: 1, aud: 'auditor3@test.com' },
  ];

  for (const ass of auditAssignments) {
    const audit = createdAudits[ass.auditIndex];
    const auditor = userMap[ass.aud];
    const auditBU = auditBUs[ass.auditIndex];

    const existing = await manager.findOne(AuditorAuditAssignment, {
      where: { auditId: audit.id, auditorId: auditor.id },
    });
    if (!existing) {
      await manager.save(
        manager.create(AuditorAuditAssignment, {
          auditId: audit.id,
          auditorId: auditor.id,
          auditBusinessUnitId: auditBU.id,
        }),
      );
      console.log(`Assigned ${ass.aud} to audit ${audit.name}`);
    }
  }

  // 8. Create Pending Exception Request (Audit 1)
  const audit1Item = scopeItems[0];
  const existingException = await manager.findOne(ExceptionRequest, {
    where: { auditScopeLineItemId: audit1Item.id },
  });
  if (!existingException) {
    await manager.save(
      manager.create(ExceptionRequest, {
        auditScopeLineItemId: audit1Item.id,
        auditorId: userMap['auditor1@test.com'].id,
        managerId: userMap['manager1@test.com'].id,
        justification:
          'Critical business dependency prevents compliance during this specific audit cycle.',
        status: ExceptionStatus.PENDING,
      }),
    );
    audit1Item.status = LineItemStatus.EXCEPTION_PENDING;
    await manager.save(audit1Item);
    console.log('Created pending exception request for Audit 1');
  }

  // 9. Create Pending Clarification Request (Audit 1)
  const existingClarification = await manager.findOne(ClarificationRequest, {
    where: {
      auditId: createdAudits[0].id,
      status: ClarificationStatus.PENDING,
    },
  });
  if (!existingClarification) {
    await manager.save(
      manager.create(ClarificationRequest, {
        auditId: createdAudits[0].id,
        managerId: userMap['manager1@test.com'].id,
        clientId: userMap['client1@test.com'].id,
        message:
          'Can you please provide the latest revision of the SOP document for reference?',
        status: ClarificationStatus.PENDING,
      }),
    );
    console.log('Created pending clarification thread for Audit 1');
  }

  // 10. Exceptional Action Requests (Admin workflow testing)
  const actionTypes = [
    ExceptionalActionType.REOPEN,
    ExceptionalActionType.DELETE,
  ];
  for (const actionType of actionTypes) {
    const audit = createdAudits[0];
    const mgr = userMap['manager1@test.com'];
    const justification = `Administrative test request for ${actionType}.`;

    const actionRequest = await manager.findOne(ExceptionalActionRequest, { 
      where: { auditId: audit.id, actionType: actionType, requestedById: mgr.id } 
    });


    if (!actionRequest) {
      await manager.save(
        manager.create(ExceptionalActionRequest, {
          auditId: audit.id,
          actionType: actionType,
          justification: justification,
          status: ExceptionalRequestStatus.PENDING,
          requestedById: mgr.id,
        }),
      );
    } else {
      actionRequest.status = ExceptionalRequestStatus.PENDING;
      await manager.save(actionRequest);
    }
  }

  // Save the first audit ID for environment-specific testing
  fs.writeFileSync(
    join(__dirname, '..', '..', '..', '..', 'e2e-env.json'),
    JSON.stringify({ TEST_AUDIT_ID: createdAudits[0].id }),
  );

  console.log(
    `Seeding complete. Primary Test Audit ID: ${createdAudits[0].id}`,
  );
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

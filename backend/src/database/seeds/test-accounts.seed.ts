import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { Audit, AuditStatus } from '../entities/audit.entity';
import { AuditScopeLineItem, InputMethod, LineItemSource, LineItemStatus } from '../entities/audit-scope-line-item.entity';
import { ManagerAuditorMapping } from '../entities/manager-auditor-mapping.entity';
import { ManagerClientMapping } from '../entities/manager-client-mapping.entity';
import { ExceptionRequest, ExceptionStatus } from '../entities/exception-request.entity';
import { ClarificationRequest, ClarificationStatus } from '../entities/clarification-request.entity';
import { BusinessUnit } from '../entities/business-unit.entity';
import { AuditBusinessUnit } from '../entities/audit-business-unit.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
    synchronize: false, // Don't sync, assume migrations are run
    logging: true,
  });

  await dataSource.initialize();
  const manager = dataSource.manager;

  console.log('Seeding test data...');

  // 1. Create Tenant
  let tenant = await manager.findOne(Tenant, { where: { slug: 'gt-bharat' } });
  if (!tenant) {
    tenant = manager.create(Tenant, {
      name: 'GT Bharat',
      slug: 'gt-bharat',
    });
    await manager.save(tenant);
  }

  // 2. Create Users
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  
  const usersToCreate = [
    { email: 'admin@test.com', fullName: 'Test Admin', role: UserRole.ADMIN },
    { email: 'manager@test.com', fullName: 'Test Manager', role: UserRole.MANAGER },
    { email: 'auditor@test.com', fullName: 'Test Auditor', role: UserRole.AUDITOR },
    { email: 'client@test.com', fullName: 'Test Client', role: UserRole.CLIENT },
  ];

  const userMap: Record<string, User> = {};

  for (const userData of usersToCreate) {
    let user = await manager.findOne(User, { where: { email: userData.email } });
    if (!user) {
      user = manager.create(User, {
        ...userData,
        passwordHash,
        status: UserStatus.ACTIVE,
        isFirstLogin: false,
      });
      await manager.save(user);
    } else {
      // Update existing user for consistency
      user.passwordHash = passwordHash;
      user.isFirstLogin = false;
      user.status = UserStatus.ACTIVE;
      await manager.save(user);
    }
    userMap[userData.role] = user;
  }

  // 3. Create Mappings
  const mappings = [
    { manager: userMap.manager, auditor: userMap.auditor },
    { manager: userMap.manager, client: userMap.client },
  ];

  for (const m of mappings) {
    if ('auditor' in m) {
      const existing = await manager.findOne(ManagerAuditorMapping, { 
        where: { managerId: m.manager.id, auditorId: m.auditor.id } 
      });
      if (!existing) {
        await manager.save(manager.create(ManagerAuditorMapping, { managerId: m.manager.id, auditorId: m.auditor.id }));
      }
    } else {
      const existing = await manager.findOne(ManagerClientMapping, { 
        where: { managerId: m.manager.id, clientId: m.client.id } 
      });
      if (!existing) {
        await manager.save(manager.create(ManagerClientMapping, { managerId: m.manager.id, clientId: m.client.id }));
      }
    }
  }

  // 4. Create Audit
  let audit = await manager.findOne(Audit, { where: { name: 'UAT-TEST-AUDIT' } });
  if (!audit) {
    audit = manager.create(Audit, {
      name: 'UAT-TEST-AUDIT',
      status: AuditStatus.DRAFT,
      managerId: userMap.manager.id,
      clientId: userMap.client.id,
      description: 'System-seeded audit for E2E testing.',
      startDate: new Date(),
      expectedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await manager.save(audit);
  }

  // 5. Create Business Unit and Link to Audit
  let bu = await manager.findOne(BusinessUnit, { where: { name: 'Core Operations' } });
  if (!bu) {
    bu = manager.create(BusinessUnit, { 
      name: 'Core Operations',
      clientId: userMap.client.id
    });
    await manager.save(bu);
  }

  let auditBU = await manager.findOne(AuditBusinessUnit, { 
    where: { auditId: audit.id, businessUnitId: bu.id } 
  });
  if (!auditBU) {
    auditBU = manager.create(AuditBusinessUnit, { auditId: audit.id, businessUnitId: bu.id });
    await manager.save(auditBU);
  }

  // 6. Create Scope Line Items
  const lineItems = [
    { name: 'Data Privacy Policy', method: InputMethod.FREE_TEXT },
    { name: 'Access Control Logs', method: InputMethod.FREE_TEXT },
    { name: 'Encryption Standards', method: InputMethod.FREE_TEXT },
    { name: 'Backup Frequency', method: InputMethod.MULTIPLE_CHOICE },
    { name: 'Incident Response Plan', method: InputMethod.MULTIPLE_CHOICE },
  ];

  const createdItems: AuditScopeLineItem[] = [];

  for (let i = 0; i < lineItems.length; i++) {
    let item = await manager.findOne(AuditScopeLineItem, { 
      where: { auditId: audit.id, name: lineItems[i].name } 
    });
    if (!item) {
      item = manager.create(AuditScopeLineItem, {
        auditId: audit.id,
        auditBusinessUnitId: auditBU.id,
        name: lineItems[i].name,
        description: `Description for ${lineItems[i].name}`,
        inputMethod: lineItems[i].method,
        source: LineItemSource.MANUAL,
        status: LineItemStatus.NOT_STARTED,
        displayOrder: i,
      });
      await manager.save(item);
    }
    createdItems.push(item);
  }

  // 7. Create Exception Request
  const existingException = await manager.findOne(ExceptionRequest, { 
    where: { auditScopeLineItemId: createdItems[0].id } 
  });
  if (!existingException) {
    const exception = manager.create(ExceptionRequest, {
      auditScopeLineItemId: createdItems[0].id,
      auditorId: userMap.auditor.id,
      managerId: userMap.manager.id,
      justification: 'Critical business process prevents immediate compliance for this item.',
      status: ExceptionStatus.PENDING,
    });
    await manager.save(exception);
    
    // Update line item status
    createdItems[0].status = LineItemStatus.EXCEPTION_PENDING;
    await manager.save(createdItems[0]);
  }

  // 8. Create Clarification Request
  const existingClarification = await manager.findOne(ClarificationRequest, { 
    where: { auditId: audit.id, managerId: userMap.manager.id, clientId: userMap.client.id } 
  });
  if (!existingClarification) {
    const clarification = manager.create(ClarificationRequest, {
      auditId: audit.id,
      managerId: userMap.manager.id,
      clientId: userMap.client.id,
      message: 'Please provide more details on the data retention policy for regional offices.',
      status: ClarificationStatus.PENDING,
    });
    await manager.save(clarification);
  }

  fs.writeFileSync(join(__dirname, '..', '..', '..', '..', 'e2e-env.json'), JSON.stringify({ TEST_AUDIT_ID: audit.id }));
  console.log(`Seeding complete. Test Audit ID: ${audit.id}`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

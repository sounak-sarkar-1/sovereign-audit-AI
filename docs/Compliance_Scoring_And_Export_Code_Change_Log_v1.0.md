# Sovereign Audit AI: Compliance Scoring & Export Handover Log (v1.0)

> **Handover Note**: This document provides a granular, code-level log of the implementation for features developed across Prompts 1–7. Use this to trace specific logic without hunting through the codebase.

---

## 1. Feature-to-File Matrix

| Feature Module | Key Backend Files | Key Frontend Files |
| :--- | :--- | :--- |
| **Scoring Schema** | `audit-scope-line-item.entity.ts`, `line-item-response.entity.ts` | `ScopeItemsTable.tsx`, `ResponseDialog.tsx` |
| **Weightage UI** | `scope.controller.ts`, `scope.service.ts` | `ScopeTab.tsx`, `ScopeItemsTable.tsx` |
| **Compliance Logic** | `reports.service.ts`, `report-generation.worker.ts` | `ReportsTab.tsx` |
| **Audit Series** | `audit.entity.ts`, `audits.service.ts` | `ExecutiveCockpit.tsx`, `ComplianceComparisonModal.tsx` |
| **Excel Export** | `reports.service.ts` (ExcelJS) | `ReportsTab.tsx`, `ReportReview.tsx` |

---

## 2. Detailed Implementation Logs

### [Prompt 1] Data Architecture & Schema Updates
**Objective**: Provision the database to support weightages, scores, and audit linking.

#### [Backend] Database Migrations
- **File**: `backend/src/database/migrations/1744570000000-AddWeightageToLineItems.ts`
- **Lines**: 1–18
- **Change**: Added `weightage` DECIMAL(5,2) to `audit_scope_line_items`.

#### [Backend] Entity Updates
- **File**: `backend/src/database/entities/audit-scope-line-item.entity.ts`
- **Lines**: 118–122
```typescript
@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
weightage: number;
```

- **File**: `backend/src/database/entities/line-item-response.entity.ts`
- **Lines**: 62–67
```typescript
@Column({ type: 'smallint', name: 'compliance_score', nullable: true })
complianceScore: number; // 1-5 scale
```

- **File**: `backend/src/database/entities/audit.entity.ts`
- **Lines**: 78–82
```typescript
@Column({ type: 'uuid', name: 'previous_audit_id', nullable: true })
previousAuditId: string;

@ManyToOne(() => Audit)
@JoinColumn({ name: 'previous_audit_id' })
previousAudit: Audit;
```

---

### [Prompt 2] Backend Scoring & Calculation Logic
**Objective**: Automate compliance percentage calculation using weightages.

#### [Backend] Compliance Calculation (Report Gen)
- **File**: `backend/src/manager/reports/reports.service.ts`
- **Lines**: 100–141
- **Logic**: Iterates over line items, adjusts weightages to exclude exception items, and applies formula: `Σ ((score - 1) / 4 * adjusted_weight)`.

```typescript
// Representative Logic (Lines 118-134)
for (const item of activeItems) {
  const response = item.responses.find((r) => !r.isDraft);
  // ... validation
  const adjustedWeight = (Number(item.weightage || 0) / activeWeightageSum) * 100;
  const scoreContribution = ((response.complianceScore - 1) / 4) * adjustedWeight;
  totalContribution += scoreContribution;
}
const compliancePercentage = Math.round(totalContribution * 100) / 100;
```

---

### [Prompt 3] Manager Scope Tab — Weightage UI
**Objective**: Provide UI for bulk weightage management and auto-distribution.

#### [Frontend] Weightage Summary Bar
- **File**: `frontend/src/pages/manager/ScopeTab.tsx`
- **Lines**: 322–357
- **UI**: Displays total weightage (must be 100%) and "Distribute Equally" button.

#### [Frontend] Inline Weightage Editing
- **File**: `frontend/src/pages/manager/ScopeItemsTable.tsx`
- **Lines**: 118–132
- **UI**: `Input` field with `AlertTriangle` fallback for missing weightages.

#### [Frontend] API Integration (Debounced update)
- **File**: `frontend/src/pages/manager/ScopeItemsTable.tsx`
- **Lines**: 49–67
```typescript
const handleWeightageChange = (itemId: string, value: string) => {
  // ... local state update
  timeoutRef.current[itemId] = setTimeout(async () => {
    await scopeService.updateWeightages(auditId, [{ id: itemId, weightage: parseFloat(value) }]);
    if (onRefresh) onRefresh();
  }, 500);
};
```

---

### [Prompt 4] Auditor Compliance Entry & Comparison
**Objective**: Enforce 1–5 scoring and allow Managers to verify shifts from previous audits.

#### [Frontend] Compliance Score Selector
- **File**: `frontend/src/pages/auditor/ResponseDialog.tsx`
- **Lines**: 150–192
- **UI**: 1–5 segmented button selector with tooltips (e.g., "Mostly Non-Compliant").

#### [Frontend] Compliance Performance Modal
- **File**: `frontend/src/components/manager/ComplianceComparisonModal.tsx`
- **Lines**: 131–195
- **UI**: Side-by-side table comparing Current vs. Previous score per line item with delta indicators (`ArrowUp`/`ArrowDown`).

---

### [Prompt 5] Client Executive Cockpit — Insights
**Objective**: High-level visibility for Client persona.

#### [Frontend] Cockpit KPI Card
- **File**: `frontend/src/pages/client/ExecutiveCockpit.tsx`
- **Lines**: 144–158
- **UI**: "Compliance Health" card showing current percentage and delta from last audit.

#### [Frontend] Report Summary Overview
- **File**: `frontend/src/pages/client/ReportReview.tsx`
- **Lines**: 168–210
- **UI**: Score badge with dynamic color (Green/Amber/Red) and "Shift vs Prev" breakdown.

---

### [Prompt 6] Excel Export Methodology (ExcelJS)
**Objective**: Generate auditor-friendly data exports.

#### [Backend] Excel Generation Logic
- **File**: `backend/src/manager/reports/reports.service.ts`
- **Lines**: 382–475
- **Logic**: Uses `exceljs` to create worksheets with formatted headers, alternating row colors, and exception highlighting.

#### [Frontend] Export Trigger
- **File**: `frontend/src/pages/manager/ReportsTab.tsx`
- **Lines**: 288–298
- **UI**: "Export Line Items" button with `Download` icon and loading state.

---

### [Prompt 7] Documentation Synchronization
**Objective**: Maintenance of changelogs and system guides.

#### [Docs] Release Changelog
- **File**: `docs/CHANGELOG.md`
- **Lines**: 1–46
- **Update**: Detailed v1.2.0 features, DB changes, and new API routes.

---

## 3. Cross-Cutting Notes
- **Tenant Isolation**: All compliance scores are scoped to the current tenant schema set by `X-Tenant-Slug`.
- **Validation**: Reports *cannot* be generated if total weightage ≠ 100%. This is enforced in `ManagerReportsService.generate`.
- **Audit Series**: The `previousAuditId` column is populated during audit creation or edit via `ManagerAuditsService`.

## 4. Post-Implementation Checklist
- [x] Column `weightage` added to `audit_scope_line_items`.
- [x] Column `compliance_score` added to `line_item_responses`.
- [x] "Distribute Equally" logic yields exactly 100.00% (handling remainders).
- [x] Excel export styles correctly apply to "Submitted" vs "Exception Pending" rows.
- [x] Client Executive Cockpit correctly retrieves `previous_audit_id` from the base audit entity.

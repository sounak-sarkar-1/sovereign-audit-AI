# Sovereign Audit AI - Backend Architecture

## Reports Module

### Compliance Score Calculation
The compliance percentage is calculated at report generation time and stored as a snapshot on the `AuditReport` entity.

**Formula:**
`compliancePercentage = Σ ((score_i - 1) / 4 × adjustedWeight_i) × 100`

Where:
- `score_i`: Auditor's 1–5 compliance score for line item `i`.
- `adjustedWeight_i`: `weightage_i / Σ(weightages of non-excluded items) × 100`.
- Items with status `exception_approved` are excluded from both numerator and denominator.

**Thresholds:**
- ≥ 90%  → **Compliant** (Green)
- 60–89% → **Needs Improvement** (Amber)
- < 60%  → **Critical** (Red)

**Visibility:**
`compliancePercentage` is returned in `GET /manager/audits/:id/reports` and `GET /client/audits/:id/reports`. It is **never** exposed in any auditor endpoint.

---

## Scope Module

### Weightage Management
- Each `AuditScopeLineItem` has a `weightage` field (DECIMAL 5,2, nullable).
- Weightages must sum to 100% across all line items in an audit.
- **Bulk update**: `PUT /manager/audits/:id/scope/weightages`
- **Auto-distribute**: `POST /manager/audits/:id/scope/weightages/distribute-equally`
- Report generation validates weightage sum before proceeding.
- Excel/template imports: `weightage` column used if present; equal distribution applied if absent.

---

## Audit Entity

### Audit Series
- `audits.previous_audit_id` (nullable FK → `audits.id`)
- Enables compliance trend tracking across recurring audits for the same client.
- **Comparison data**: `GET /manager/audits/:id/compliance-comparison`
- Returns: delta percentage + per-line-item score comparison.

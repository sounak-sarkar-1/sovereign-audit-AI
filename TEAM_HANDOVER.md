# Sovereign Audit AI - Team Handover

## Current Status

### ✅ Completed Features (v1.2.0)
- **Compliance scoring system** (weightages + auditor 1–5 score + calculated %)
- **Audit series linking** (previousAuditId + comparison modal)
- **Excel export** of line items (Manager + Client)

### Known Limitations
- Audit series comparison matches line items by name (case-insensitive)
  If line item names change between audits, they appear as New/Removed.
- Weightage must be set manually if not present in Excel/template import.
- Compliance score is a point-in-time snapshot — regenerating the report
  recalculates the score based on current data.

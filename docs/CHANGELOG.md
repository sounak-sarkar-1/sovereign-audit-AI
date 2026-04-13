# Changelog
All notable changes to the Sovereign Audit AI project will be documented in this file.

---
## v1.2.0 — April 2026

### New Features

#### Compliance Scoring System
- Manager can assign percentage weightages to each audit scope line item
- All weightages must sum to 100% before report generation
- "Distribute Equally" button auto-assigns equal weightage across all items
- Auditors provide a 1–5 compliance score on each line item at submission
- Compliance percentage is calculated at report generation using weighted average:
  Formula: Σ ((score_i - 1) / 4 × adjusted_weight_i) × 100
- Exception-approved items are excluded and weightages redistributed proportionally
- Score displayed with colour coding: ≥90% Green, 60–89% Amber, <60% Red
- Compliance score stored as snapshot on audit_reports.compliance_percentage
- Score visible to Manager, Client, Admin only — never Auditor

#### Audit Series Linking
- Manager can mark an audit as a follow-up of a previous audit (same client)
- Stored via audits.previous_audit_id foreign key
- Compliance delta (current vs previous) shown on Manager Report Tab and Client views
- Line-item drill-down comparison available via ComplianceComparisonModal

#### Excel Export — Audit Line Items
- Manager and Client can export all scope line items as a formatted .xlsx file
- Available once audit reaches 'under_manager_review' status or beyond
- Export includes: BU, Line Item, Description, Input Method, Auditor Score, Status, Exception Raised, Exception Status, Weightage (%), Weighted Contribution (%)
- Exception rows highlighted in amber; purple header row; frozen header; summary footer

### Database Changes
- `audit_scope_line_items`: +`weightage` DECIMAL(5,2)
- `audit_reports`: +`compliance_percentage` DECIMAL(5,2)
- `audits`: +`previous_audit_id` UUID FK → audits(id)
- `line_item_responses`: +`compliance_score` SMALLINT (1–5)

### New API Endpoints
- PUT    `/manager/audits/:id/scope/weightages`
- POST   `/manager/audits/:id/scope/weightages/distribute-equally`
- GET    `/manager/audits/:id/reports/export-line-items`
- GET    `/manager/audits/:id/compliance-comparison`
- GET    `/client/audits/:id/reports/export-line-items`
- GET    `/client/audits/:id/compliance-comparison`

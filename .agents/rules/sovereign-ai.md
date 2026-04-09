---
trigger: always_on
---

# SOVEREIGN AUDIT AI — Root Briefing File

> **For AI agents (Google Antigravity / Claude / Gemini):** Read this file in full before touching any code. It is the single source of truth for architecture, conventions, and constraints. Do not infer conventions from the codebase — defer to this file when there is a conflict.

---

## 1. Project Identity

| Attribute | Value |
|---|---|
| Product Name | Sovereign Audit AI |
| Type | Multi-tenant SaaS — Audit Management Platform |
| Stage | Greenfield v1 build |
| Spec documents | `/docs/` — BRD, DSD, API Spec, UI Spec (4×), Sequence Diagrams, User Stories, this file |
| Primary stakeholder | GT Bharat engagement — Confidential |

### What this product does
A four-persona audit management platform (Admin, Manager, Auditor, Client) that digitises the full audit lifecycle: scope definition (manual / Excel import / Gen AI extraction from SOP documents), auditor field work, exception management, AI-generated DOCX report creation, client review with structured feedback, and executive analytics. Three Gen AI features: scope extraction, report generation, and NL search over historical reports.

---

## 2. Personas and Role Boundaries

| Role | Key Capabilities | Cannot Do |
|---|---|---|
| `admin` | User CRUD, mappings, BUs, AI model config, templates, oversight, exceptional request decisions | Initiate or participate in audits |
| `manager` | Initiate audits, define scope, assign auditors, review exceptions, generate reports, finalise | Direct data entry on scope items |
| `auditor` | Enter responses, upload docs, raise exceptions, submit work | See co-auditor response values; see client data |
| `client` | View progress, search reports (NL), review draft report, submit section feedback, respond to clarifications | See auditor names/responses; edit scope |

One role per user — strictly enforced. Role is immutable after creation.

---

## 3. Tech Stack

### Backend
```
Runtime:        Node.js 20 LTS
Framework:      NestJS (TypeScript) — modular, decorator-driven
Database:       PostgreSQL 15
ORM/Query:      TypeORM (entities + QueryBuilder; no raw SQL except migrations)
Job Queue:      pg-boss (Postgres-backed; NO Redis; NO BullMQ)
Auth:           JWT (access token: short-lived) + httpOnly Refresh Token cookie
File Storage:   Local filesystem (dev) / S3-compatible bucket (prod) — abstracted via StorageService
API Style:      REST — URL path versioning at /api/v1/
Tenant Header:  X-Tenant-Slug on every authenticated request
Password Hash:  bcrypt (rounds: 12)
Encryption:     AES-256-GCM for AI model API keys at rest
```

### Frontend
```
Framework:      React 18 (TypeScript + Vite)
UI Library:     Shadcn/ui + Tailwind CSS
Dark Mode:      Tailwind dark: prefix — toggled via class on <html>; persisted in localStorage
Navigation:     Collapsible left sidebar (240px expanded / 64px icon rail) + top header bar
Icons:          lucide-react
HTTP Client:    Axios with interceptors for token refresh
State:          TanStack Query (server state) + Zustand (UI/auth state)
Forms:          React Hook Form + Zod validation
Routing:        React Router v6
Charts:         Recharts (insights dashboard)
```

### Infrastructure (Production)
```
Containerisation: Docker + Docker Compose
Reverse Proxy:    Nginx
Process Manager:  PM2 (Node.js) inside containers
File Storage:     S3-compatible (MinIO self-hosted OR AWS S3)
Database:         PostgreSQL 15 (managed or self-hosted)
```

---

## 4. Repository Structure

```
/
├── CLAUDE.md                    ← YOU ARE HERE
├── docs/                        ← All specification documents (read before coding a module)
│   ├── BRD_v1.0.docx
│   ├── DSD_v1.0.docx            ← 28-table schema; authoritative for DB structure
│   ├── API_v1.0.docx            ← ~67 endpoints; authoritative for request/response shapes
│   ├── UI_Admin_v1.0.docx
│   ├── UI_Manager_v1.0.docx
│   ├── UI_Auditor_v1.0.docx
│   ├── UI_Client_v1.0.docx
│   ├── Sequence_Diagrams_v1.0.docx
│   └── User_Stories_v1.0.docx
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/              ← env config, validation schema (Joi/Zod)
│   │   ├── common/
│   │   │   ├── decorators/      ← @CurrentUser, @Roles, @TenantSlug
│   │   │   ├── guards/          ← JwtAuthGuard, RolesGuard, TenantGuard
│   │   │   ├── interceptors/    ← TransformResponseInterceptor, LoggingInterceptor
│   │   │   ├── filters/         ← GlobalExceptionFilter
│   │   │   ├── pipes/           ← ValidationPipe (global, whitelist: true)
│   │   │   └── dto/             ← Shared DTOs (PaginationDto, etc.)
│   │   ├── database/
│   │   │   ├── migrations/      ← TypeORM migrations; one file per schema change
│   │   │   ├── seeds/           ← Dev seed scripts
│   │   │   └── database.module.ts
│   │   ├── tenant/              ← Tenant resolution middleware
│   │   ├── auth/                ← Login, refresh, logout, change-password
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── mappings/
│   │   │   ├── business-units/
│   │   │   ├── ai-models/
│   │   │   ├── templates/
│   │   │   ├── audits/          ← Read-only oversight
│   │   │   └── exceptional-requests/
│   │   ├── manager/
│   │   │   ├── audits/
│   │   │   ├── scope/
│   │   │   ├── assignments/
│   │   │   ├── exceptions/
│   │   │   ├── clarifications/
│   │   │   └── reports/
│   │   ├── auditor/
│   │   │   ├── audits/
│   │   │   ├── scope/
│   │   │   └── exceptions/
│   │   ├── client/
│   │   │   ├── audits/
│   │   │   ├── insights/
│   │   │   ├── search/
│   │   │   ├── clarifications/
│   │   │   └── reports/
│   │   ├── shared/
│   │   │   ├── notifications/
│   │   │   ├── files/
│   │   │   └── ai-jobs/
│   │   ├── ai/
│   │   │   ├── ai.service.ts    ← Central AI call abstraction; reads active model from DB
│   │   │   ├── scope-extraction.worker.ts
│   │   │   └── report-generation.worker.ts
│   │   ├── jobs/
│   │   │   └── jobs.module.ts   ← pg-boss initialisation and worker registration
│   │   └── storage/
│   │       └── storage.service.ts  ← Abstracts local FS vs S3
│   ├── test/
│   │   ├── unit/
│   │   └── e2e/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx              ← Router, QueryClient, ThemeProvider
│   │   ├── lib/
│   │   │   ├── api.ts           ← Axios instance with interceptors
│   │   │   ├── auth.ts          ← Token storage, refresh logic
│   │   │   └── utils.ts
│   │   ├── hooks/               ← useAuth, useNotifications, useTenant, etc.
│   │   ├── stores/              ← Zustand stores (auth, theme, notifications)
│   │   ├── components/
│   │   │   ├── ui/              ← Shadcn/ui generated components (DO NOT EDIT MANUALLY)
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── NotificationDrawer.tsx
│   │   │   └── shared/          ← KPICard, StatusBadge, FileChip, ConfirmDialog, etc.
│   │   ├── pages/
│   │   │   ├── auth/            ← Login, ForcePasswordReset
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   ├── auditor/
│   │   │   └── client/
│   │   └── types/               ← Shared TypeScript interfaces (mirrors API shapes)
│   ├── index.html
│   ├── tailwind.config.ts       ← Brand palette tokens defined here
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## 5. Database Architecture

### Multi-Tenancy
- **Global schema** (`global`): One table — `global.tenants` (id UUID, name, slug, created_at, deleted_at)
- **Per-tenant schema** (`tenant_{slug}`): All other 27 tables
- Tenant resolution: `X-Tenant-Slug` header → `TenantMiddleware` sets `schema` on the TypeORM connection for the request
- **Never query across tenant schemas.** All queries are scoped to the resolved tenant schema.

### Primary Keys
All tables use `UUID` primary keys generated server-side via `gen_random_uuid()`. Never use integer sequences.

### Soft Deletes
All tables have `deleted_at TIMESTAMPTZ NULL`. All repository queries **must** include `WHERE deleted_at IS NULL` (use TypeORM `@DeleteDateColumn` decorator for automatic handling).

### Key Table Reference
See `docs/DSD_v1.0.docx` for full DDL. Summary of tables most commonly touched:

| Table | Purpose |
|---|---|
| `users` | All personas; `role` enum: admin/manager/auditor/client; `is_first_login` bool |
| `audits` | Core entity; `status` enum (see §6 below) |
| `audit_scope_line_items` | One per scope item; `status`, `input_method`, `is_optional`, `source` |
| `line_item_responses` | Auditor's response; `is_draft` bool; `response_text` or `selected_option_id` |
| `exception_requests` | Raised by auditor; managed by manager |
| `audit_reports` | DOCX report; `version` int; `status`; `file_id` FK to `uploaded_files` |
| `ai_jobs` | Async AI job tracking; `status`: queued/processing/completed/failed |
| `audit_trail_logs` | Immutable; `INSERT` only; **never UPDATE or DELETE** |
| `notifications` | In-app; `is_read` bool; `related_entity_type` + `related_entity_id` |
| `ai_models` | Only one record can have `is_active=true` at a time (enforced in service layer) |

---

## 6. Audit Lifecycle State Machine

```
draft → in_progress → under_manager_review → pending_client_review → closed
                                   ↑__________________________|  (feedback loop)
                                                              ↓
                                                          reopened  (via exceptional request)
```

**State transition rules (enforce in service layer, not just DB):**
- `draft → in_progress`: requires scope items > 0 AND at least 1 auditor assigned. Triggered by `POST /manager/audits/:id/start`.
- `in_progress → under_manager_review`: triggered automatically when report generation job is dispatched (`POST /manager/audits/:id/reports/generate`).
- `under_manager_review → pending_client_review`: `POST .../send-to-client`
- `pending_client_review → under_manager_review`: when client submits feedback
- `under_manager_review → closed`: `POST .../finalize`
- `closed → reopened`: only via exceptional_action_request approved by Admin
- Any status → soft-deleted: only via exceptional_action_request (delete type) approved by Admin

---

## 7. Line Item Status State Machine

```
not_started → draft_saved → submitted (terminal — locked)
     ↓                           ↑
exception_pending → exception_approved (terminal)
     ↓
exception_rejected → returned → [auditor re-submits] → draft_saved → submitted
```

**Rules:**
- Items with `is_optional=true` can remain `not_started` at submission time — this is not an error.
- Once `submitted` or `exception_approved`, the item is **immutable** — no updates permitted.
- `returned` items are fully re-editable (treat same as `not_started` for response entry).

---

## 8. Authentication and Authorisation

### JWT Strategy
- Access token: short-lived (15 minutes), signed with `JWT_SECRET`, carried in `Authorization: Bearer <token>` header
- Refresh token: stored httpOnly cookie (`refreshToken`); used at `POST /api/v1/auth/refresh`; stored hashed in `refresh_tokens` table with `expires_at` and `device_info`
- On refresh: validate stored hash, issue new access token (optionally rotate refresh token — configurable)
- On logout: delete refresh token record from DB; clear cookie

### Guard Stack (apply in this order on every protected route)
1. `JwtAuthGuard` — validates access token; attaches `user` to request
2. `TenantGuard` — validates `X-Tenant-Slug` header; attaches `tenantSchema` to request
3. `RolesGuard` — checks `user.role` against `@Roles()` decorator on controller

### Role Enforcement
- Use `@Roles('manager')` decorator at controller method level
- **Never trust the frontend for role-gating** — always enforce on every API endpoint
- Users can only access their own tenant's data — the `TenantGuard` handles schema scoping

### First Login
- `is_first_login=true` → after successful login, the access
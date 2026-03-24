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
- `is_first_login=true` → after successful login, the access token payload includes `isFirstLogin: true`
- Frontend route guard redirects to `/reset-password` — no other route accessible until changed
- `POST /auth/change-password` sets `is_first_login=false` on success

---

## 9. API Conventions

### Base URL
```
/api/v1/
```

### Request Format
- JSON body for all POST/PUT/PATCH
- `Content-Type: application/json`
- Multipart for file uploads (`Content-Type: multipart/form-data`)
- `X-Tenant-Slug: {slug}` header on every authenticated request

### Pagination (all list endpoints)
```json
// Query params
?page=1&limit=20&sortBy=created_at&sortOrder=DESC

// Response envelope
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Standard Error Shape
```json
{
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Human-readable description",
  "errors": [{ "field": "email", "message": "Must be a valid email" }]
}
```

### Error Code Reference
| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Valid JWT but insufficient role |
| 404 | `NOT_FOUND` | Resource not found in tenant |
| 409 | `CONFLICT` | Duplicate resource (e.g. email) |
| 410 | `GONE` | Import session expired |
| 422 | `BUSINESS_RULE_ERROR` | Violates a domain rule (e.g. duplicate pending exceptional request) |
| 500 | `INTERNAL_ERROR` | Unhandled server error |
| 503 | `AI_UNAVAILABLE` | No active AI model configured |

### Async Endpoints (Gen AI)
Endpoints that dispatch AI jobs return `202 Accepted` immediately:
```json
{ "jobId": "uuid", "reportId": "uuid (if applicable)" }
```
Client polls `GET /api/v1/shared/ai-jobs/:jobId` every 3 seconds until `status` is `completed` or `failed`.

---

## 10. Gen AI Integration

### How AI Calls Work
```
Request → API → INSERT ai_jobs (status=queued) → pg-boss.send(jobType, {jobId}) → 202 to client
                                                          ↓
                                              Worker picks up → reads ai_jobs record
                                              → fetches active ai_models record
                                              → decrypts API key (AES-256-GCM)
                                              → calls external AI endpoint
                                              → UPDATE ai_jobs (status=completed/failed, output_payload)
                                              → INSERT notification
```

### AI Service (`ai/ai.service.ts`)
- Single public method: `callModel(prompt: string, systemPrompt: string): Promise<string>`
- Reads active model from DB on every call — **do not cache the model config in memory**
- Throws `AiUnavailableException` (→ 503) if no active model found
- Decrypts API key using `AES_ENCRYPTION_KEY` from env before calling
- All external AI calls have a configurable timeout (default 120 seconds)

### Three AI Features
| Feature | Job Type | Input | Output |
|---|---|---|---|
| Scope Extraction | `scope-extraction` | fileId (SOP document) + auditId + buId | `{ lineItems: [{name, description, inputMethod}] }` |
| Report Generation | `report-generation` | auditId + reportId | Generated DOCX file saved to storage; fileId returned |
| NL Search | `nl-search` | query string + clientId | `{ answer: string, sources: [{auditName, date, excerpt}] }` |

### Prompt Guidelines for AI Workers
- Always include a `systemPrompt` that constrains the output format (JSON for extraction/search, structured content for reports)
- For scope extraction: request JSON array with `name`, `description`, `inputMethod` fields
- For report generation: provide full audit data as structured context; request section-by-section content
- For NL search: limit to client's own completed audit reports; include source attribution instructions

---

## 11. File Storage

### StorageService Interface
```typescript
interface StorageService {
  upload(file: Buffer, filename: string, folder: string): Promise<{ path: string, storedFilename: string }>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl?(path: string, expiresIn: number): Promise<string>; // S3 only
}
```

- `LOCAL_STORAGE_PATH` env var: base path for local FS storage
- `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` for S3
- `STORAGE_DRIVER` env var: `local` | `s3` — determines which implementation is injected

### File Upload Rules (enforce in FileValidationPipe)
- Max size: **10 MB** per file
- Allowed MIME types by context:
  - SOP documents (scope extraction): `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Auditor supporting docs: above + `image/jpeg`, `image/png`
  - Exception evidence: same as auditor docs
  - Report upload (manager edited): DOCX only
  - Exceptional request evidence (admin): all four types
- Store original filename in `uploaded_files.original_filename`; generate a UUID-based `stored_filename`

---

## 12. Background Jobs (pg-boss)

### Job Registration Pattern
```typescript
// In jobs.module.ts — register all workers at startup
await boss.work('scope-extraction', async (job) => { ... });
await boss.work('report-generation', async (job) => { ... });
await boss.work('nl-search', async (job) => { ... });
```

### Worker Responsibilities
1. Update `ai_jobs.status = 'processing'` immediately on pickup
2. Perform work (AI call, file generation, etc.)
3. On success: UPDATE `ai_jobs` SET `status='completed'`, `output_payload=...`, `completed_at=NOW()`
4. On failure: UPDATE `ai_jobs` SET `status='failed'`, `error_message=...`, `completed_at=NOW()`
5. Always insert a `notifications` record on completion/failure for the originating user
6. Workers must be idempotent — pg-boss may retry on crash

### Polling (Frontend)
- Poll interval: 3 seconds
- Max polls: 120 (6 minutes timeout — show error if exceeded)
- Terminate poll on `status = completed | failed`

---

## 13. Audit Trail Logging

The `audit_trail_logs` table is **append-only and immutable**. It is the tamper-proof governance record.

```typescript
// Always use AuditTrailService — never write directly to the table
await this.auditTrailService.log({
  tenantSchema,
  actorId: user.id,
  actorRole: user.role,
  action: AuditAction.EXCEPTION_RAISED,           // enum
  entityType: 'exception_requests',
  entityId: exception.id,
  metadata: { justificationLength: justification.length },  // optional JSON
  ipAddress: request.ip,
});
```

**Log every state-changing action.** Key actions to always log (non-exhaustive):
`USER_CREATED`, `AUDIT_CREATED`, `AUDIT_STARTED`, `SCOPE_DEFINED`, `AUDITOR_ASSIGNED`, `RESPONSE_SUBMITTED`, `EXCEPTION_RAISED`, `EXCEPTION_APPROVED`, `EXCEPTION_REJECTED`, `REPORT_GENERATED`, `REPORT_SENT_TO_CLIENT`, `CLIENT_FEEDBACK_SUBMITTED`, `AUDIT_CLOSED`, `AUDIT_DELETED`, `AUDIT_REOPENED`, `EXCEPTIONAL_REQUEST_RAISED`, `EXCEPTIONAL_REQUEST_APPROVED`, `EXCEPTIONAL_REQUEST_REJECTED`

---

## 14. Notifications

```typescript
// Always use NotificationService — never write to notifications table directly
await this.notificationService.create({
  tenantSchema,
  userId: targetUser.id,
  type: NotificationType.EXCEPTION_RAISED,
  title: 'Exception raised by [auditorName]',
  message: `An exception was raised on line item "${lineItem.name}"`,
  relatedEntityType: 'exception_requests',
  relatedEntityId: exception.id,
});
```

Notification types that must always be sent (see User Stories for full trigger map):
- Manager: `exception_raised`, `clarification_responded`, `client_feedback_received`, `report_ready`, `exceptional_request_resolved`
- Auditor: `exception_approved`, `exception_rejected`
- Client: `clarification_request`, `report_sent_to_client`, `audit_closed`
- Admin (all): `exceptional_request_raised`

---

## 15. Frontend Conventions

### Component Naming
- Pages: `PascalCase`, one file per route, in the correct persona folder under `pages/`
- Shared components: `PascalCase` in `components/shared/`
- Shadcn components in `components/ui/` — generated by CLI; **do not edit manually**

### Tailwind + Brand Palette
Defined in `tailwind.config.ts`. Use these CSS variables / Tailwind tokens:
```
primary:    #4f2d7f   (bg-primary, text-primary, border-primary)
dark:       #2b144d   (sidebar background, heading tints)
accent:     #a06dff   (hover states, active nav items, progress bars)
bg-warm:    #f2f0ee   (page background in light mode)
bg-mid:     #e0dcd7   (table alternating rows, section backgrounds)
bg-muted:   #ccc4bd   (disabled states, muted text backgrounds)
```
Dark mode equivalents are defined in the config. Use `dark:` prefix — never use hard-coded hex values in components.

### API Calls (TanStack Query pattern)
```typescript
// Query (GET)
const { data, isLoading, error } = useQuery({
  queryKey: ['audits', tenantSlug, filters],
  queryFn: () => api.get('/manager/audits', { params: filters }),
});

// Mutation (POST/PUT/DELETE)
const mutation = useMutation({
  mutationFn: (data) => api.post('/manager/audits', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['audits'] });
    toast.success('Audit created');
  },
});
```

### Form Validation (React Hook Form + Zod)
- Define schema with Zod; pass to `useForm` via `zodResolver`
- Show inline errors below fields using `FormMessage` from Shadcn
- Never disable form submission for empty optional fields — validate only required fields

### Route Guards
- `ProtectedRoute` component wraps all authenticated routes — redirects to `/login` if no valid token
- `FirstLoginGuard` — wraps all routes except `/reset-password` when `isFirstLogin=true`
- Role-based route access enforced by checking `user.role` in the router — not just server-side

### Polling Pattern (AI Jobs)
```typescript
const { data } = useQuery({
  queryKey: ['ai-job', jobId],
  queryFn: () => api.get(`/shared/ai-jobs/${jobId}`),
  refetchInterval: (query) =>
    query.state.data?.status === 'completed' || query.state.data?.status === 'failed'
      ? false   // stop polling
      : 3000,   // poll every 3s
  enabled: !!jobId,
});
```

---

## 16. Security Rules (Non-Negotiable)

1. **API keys (AI models)**: Always encrypted with AES-256-GCM before DB storage; never returned in any API response; never logged
2. **Passwords**: Always bcrypt-hashed (rounds: 12); never stored or logged in plaintext
3. **Tenant isolation**: Every DB query must be scoped to the resolved tenant schema. Cross-tenant queries are a critical security bug.
4. **File downloads**: Always validate that the requesting user's tenant matches the file's owning tenant before serving
5. **Role enforcement**: Every API endpoint must have `@Roles()` decorator; no endpoint is accessible by all roles unless explicitly intended
6. **Audit trail**: The `audit_trail_logs` table must never be updated or deleted — only INSERT operations permitted
7. **Input validation**: Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true` — strips unknown fields
8. **CORS**: Allow only the configured frontend origin; credentials: true (for cookie)
9. **Rate limiting**: Apply `@Throttle()` on auth endpoints (login: 10/min, refresh: 30/min)
10. **Exception evidence files**: Accessible by auditor (own files), their manager, and admin — not by the client

---

## 17. Environment Variables

```bash
# Application
NODE_ENV=development|production
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sovereign_audit
DATABASE_SSL=false

# Auth
JWT_SECRET=<32+ char random string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<different 32+ char random string>
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption (AI API keys)
AES_ENCRYPTION_KEY=<32 bytes hex>

# File Storage
STORAGE_DRIVER=local|s3
LOCAL_STORAGE_PATH=./uploads
S3_BUCKET=sovereign-audit-files
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_ENDPOINT=                  # for MinIO self-hosted

# AI (runtime config via DB — these are fallback/test only)
AI_REQUEST_TIMEOUT_MS=120000

# pg-boss
PG_BOSS_SCHEMA=pgboss         # separate schema for pg-boss tables
```

See `.env.example` for all variables. **Never commit `.env` files.**

---

## 18. Development Workflow

### Initial Setup
```bash
# Backend
cd backend && npm install
cp ../.env.example .env       # fill in values
npm run migration:run          # run all TypeORM migrations
npm run seed:dev               # seed admin user + sample tenant
npm run start:dev              # NestJS watch mode on :3000

# Frontend
cd frontend && npm install
npm run dev                    # Vite dev server on :5173
```

### Database Migrations
```bash
# Generate after entity changes
npm run migration:generate -- src/database/migrations/AddExceptionJustificationIndex

# Run pending
npm run migration:run

# Revert last
npm run migration:revert
```
**Never modify existing migrations.** Always create new ones.

### Running Tests
```bash
cd backend
npm run test              # unit tests (Jest)
npm run test:e2e          # e2e tests (Supertest)
npm run test:cov          # coverage report

cd frontend
npm run test              # Vitest unit tests
```

### Google Antigravity Agent Notes
When delegating tasks in Antigravity's Agent Manager:
- **Always provide the relevant spec document path** in the task description so the agent has full context (e.g. `"Implement the scope extraction flow — see docs/API_v1.0.docx Section 6.4 and docs/Sequence_Diagrams_v1.0.docx Flow 1"`)
- Use **Plan mode** for new module implementation — review the plan artifact before approving execution
- Use **Fast mode** only for small, contained changes (bug fixes, style tweaks)
- After any migration generation, always review the generated file before running `migration:run`
- The browser agent can be used to verify UI implementations against the UI spec screen definitions

---

## 19. Common Task Patterns

### Implementing a New API Endpoint
1. Create/update DTO in `module/dto/`
2. Add method to service (`module.service.ts`)
3. Add method to controller with correct `@Roles()`, `@Get/@Post`, and response type
4. Add audit trail log call in service for state-changing operations
5. Add notification call in service where required
6. Write unit test for service method
7. Write e2e test for endpoint

### Implementing a New Frontend Screen
1. Check the relevant `docs/UI_[Persona]_v1.0.docx` for the screen spec (screen ID, components, states, validations, navigation flows)
2. Create page file in `pages/[persona]/`
3. Implement TanStack Query hooks for data fetching
4. Implement form with React Hook Form + Zod if applicable
5. Add route in the persona's router section
6. Add route guard if role-restricted

### Adding a New AI Job Type
1. Add job type to `AiJobType` enum
2. Create worker file in `ai/`
3. Register worker in `jobs.module.ts`
4. Create service method that: validates preconditions → inserts ai_job → publishes to pg-boss → returns 202 with jobId
5. Worker: fetch job → set processing → call `ai.service.ts` → process output → set completed/failed → notify user

---

## 20. What NOT to Do

| ❌ Never | ✅ Instead |
|---|---|
| Query across tenant schemas | Always scope to resolved `tenantSchema` |
| Return AI API keys in any response | Store encrypted; never expose |
| Update or delete `audit_trail_logs` records | Append-only — INSERT only |
| Use integer primary keys | UUID everywhere (`gen_random_uuid()`) |
| Use `deleted_at IS NOT NULL` to check deleted | Use TypeORM soft-delete with `@DeleteDateColumn` |
| Hard-code tenant names or IDs | Always resolve from `X-Tenant-Slug` header |
| Cache active AI model config in memory | Read from DB on every call |
| Block the main thread for AI jobs | Always use pg-boss worker pattern |
| Allow clients to see pending exceptions | Only approved exceptions visible to client |
| Allow auditors to see co-auditor response values | Only aggregate completion % visible |
| Write directly to `notifications` table | Always use `NotificationService` |
| Write directly to `audit_trail_logs` table | Always use `AuditTrailService` |
| Store passwords in plaintext anywhere (logs, DB) | bcrypt only; never log |
| Use `console.log` in production code | Use NestJS `Logger` with structured context |

---

*Last updated: March 2026 — Aligned with BRD v1.0, DSD v1.0, API Spec v1.0, UI Spec v1.0 (all personas), Sequence Diagrams v1.0, User Stories v1.0*

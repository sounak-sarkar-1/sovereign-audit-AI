# 🛡️ Sovereign Audit AI

> [!IMPORTANT]
> Copy `backend/.env.example` to `backend/.env` and fill in real values before running the application.


**Sovereign Audit AI** is a state-of-the-art, multi-tenant SaaS platform designed to digitize and automate the high-stakes world of audit management. From initial scope definition to AI-powered report finalized, the platform provides a seamless, secure, and intelligent experience for all audit stakeholders.

---

## 🚀 Vision
Built for precision and transparency, Sovereign Audit AI leverages Generative AI to eliminate manual drudgery in audit workflows, enabling teams to focus on critical findings and strategic insights rather than data entry.

## 👥 Personas
The platform is built around four distinct roles, each with strictly enforced boundaries:

| Role | Responsibility |
|---|---|
| **Admin** | System configuration, BU & User management, AI model orchestration, and exceptional request oversight. |
| **Manager** | Audit lifecycle management: initiating audits, defining scope, assigning teams, and finalizing AI-generated reports. |
| **Auditor** | Fieldwork execution: response entry, evidence uploads, and exception management via a dedicated workspace. |
| **Client** | Oversight and collaboration: reviewing draft reports, responding to clarifications, and exploring insights via NL search. |

---

## ✨ Key Features
- **GenAI Scope Extraction**: Automatically extract audit scope items from SOP documents.
- **AI Report Generation**: One-click generation of professional DOCX reports from auditor fieldwork findings.
- **Natural Language Search**: Semantic search over historical audit reports for rapid knowledge retrieval.
- **Advanced State Machine**: Robust lifecycle management from `Draft` to `Closed` with structured feedback loops.
- **Granular Assignments**: Support for both Business Unit level and item-level auditor assignments.
- ✅ **Weighted compliance scoring** per audit scope line item
- ✅ **Automated compliance percentage calculation** at report generation
- ✅ **Audit series linking** with compliance delta tracking
- ✅ **Excel export** of audit line items with weighted contribution breakdown
- ✅ **Client-facing compliance score comparison** (current vs previous audit)

---

## 🔌 API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT    | `/manager/audits/:id/scope/weightages` | Manager | Bulk update line item weightages |
| POST   | `/manager/audits/:id/scope/weightages/distribute-equally` | Manager | Auto-distribute equal weightage |
| GET    | `/manager/audits/:id/reports/export-line-items` | Manager | Download line items as Excel |
| GET    | `/manager/audits/:id/compliance-comparison` | Manager | Get compliance delta vs previous audit |
| GET    | `/client/audits/:id/reports/export-line-items` | Client | Download line items as Excel |
| GET    | `/client/audits/:id/compliance-comparison` | Client | Get compliance delta vs previous audit |

---

## 💻 Tech Stack

### Backend (NestJS)
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript
- **ORM**: TypeORM with PostgreSQL 15
- **Queue**: pg-boss (Postgres-backed job processing)
- **Auth**: JWT with httpOnly Refresh Token cookies

### Frontend (React)
- **Framework**: React 18 + Vite
- **UI Architecture**: Shadcn/ui + Tailwind CSS
- **State**: TanStack Query (Server) + Zustand (UI/Auth)
- **Icons**: Lucide-react

---

## 📂 Repository Structure
```text
├── backend/            # NestJS API (Port 3000)
├── frontend/           # Vite + React App (Port 5173)
├── docs/               # Technical and Product Specification Documents
└── e2e/                # Playwright End-to-End Test Suite
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15 (with `pg_net` or standard uuid support)

### Installation
1. **Clone the repository**
2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Configure your DB credentials
   npm run start:dev
   ```
3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Running Tests
```bash
npx playwright test
```

---

## 🔒 Security & Multi-Tenancy
Sovereign Audit AI uses a **per-tenant schema** strategy. Every request is scoped via the `X-Tenant-Slug` header, ensuring strict data isolation between different client organizations within the same database instance.

---

*Confidential - Built for GT Bharat Engagement*

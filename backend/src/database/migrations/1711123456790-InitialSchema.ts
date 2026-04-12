import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTenantSchema1711123456790 implements MigrationInterface {
  name = 'InitialTenantSchema1711123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM ('admin','manager','auditor','client')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_status" AS ENUM ('active','inactive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ai_model_type" AS ENUM ('openai','anthropic','google','slm','open_source','other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "input_method" AS ENUM ('free_text','multiple_choice')`,
    );
    await queryRunner.query(
      `CREATE TYPE "audit_status" AS ENUM ('draft','in_progress','under_manager_review','pending_client_review','closed','reopened','deleted')`,
    );
    await queryRunner.query(
      `CREATE TYPE "line_item_status" AS ENUM ('not_started','draft_saved','submitted','exception_pending','exception_approved','exception_rejected','returned')`,
    );
    await queryRunner.query(
      `CREATE TYPE "line_item_source" AS ENUM ('manual','ai_extracted','excel_imported','template')`,
    );
    await queryRunner.query(
      `CREATE TYPE "exception_status" AS ENUM ('pending','approved','rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "file_entity_type" AS ENUM ('line_item_evidence','exception_evidence','sop_document','audit_report','exceptional_action_evidence','clarification_attachment')`,
    );
    await queryRunner.query(
      `CREATE TYPE "report_status" AS ENUM ('draft','sent_for_client_review','final')`,
    );
    await queryRunner.query(
      `CREATE TYPE "feedback_status" AS ENUM ('pending','accepted','requires_revision')`,
    );
    await queryRunner.query(
      `CREATE TYPE "clarification_status" AS ENUM ('pending','responded','closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "exceptional_action_type" AS ENUM ('reopen','delete')`,
    );
    await queryRunner.query(
      `CREATE TYPE "exceptional_request_status" AS ENUM ('pending','approved','rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "job_type" AS ENUM ('scope_extraction','report_generation','nl_search')`,
    );
    await queryRunner.query(
      `CREATE TYPE "job_status" AS ENUM ('queued','processing','completed','failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "notification_type" AS ENUM ('user_created','audit_assigned','exception_raised','exception_approved','exception_rejected','report_ready_to_generate','report_sent_to_client','client_feedback_received','clarification_request','clarification_responded','exceptional_request_raised','exceptional_request_resolved','audit_closed')`,
    );

    // 2. Authentication & Users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"          VARCHAR(255) NOT NULL UNIQUE,
        "password_hash"  VARCHAR(255) NOT NULL,
        "full_name"      VARCHAR(255) NOT NULL,
        "phone"          VARCHAR(50),
        "role"           "user_role"    NOT NULL,
        "status"         "user_status"  NOT NULL DEFAULT 'active',
        "is_first_login" BOOLEAN      NOT NULL DEFAULT TRUE,
        "created_by"     UUID         REFERENCES "users"("id"),
        "created_at"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updated_at"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "deleted_at"     TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id"          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"     UUID         NOT NULL REFERENCES "users"("id"),
        "token_hash"  VARCHAR(255) NOT NULL UNIQUE,
        "expires_at"  TIMESTAMPTZ  NOT NULL,
        "revoked_at"  TIMESTAMPTZ,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // 3. Role Mappings & Business Units
    await queryRunner.query(`
      CREATE TABLE "manager_auditor_mappings" (
        "id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "manager_id"  UUID        NOT NULL REFERENCES "users"("id"),
        "auditor_id"  UUID        NOT NULL REFERENCES "users"("id"),
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "uq_mgr_aud" UNIQUE ("manager_id", "auditor_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "manager_client_mappings" (
        "id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "manager_id"  UUID        NOT NULL REFERENCES "users"("id"),
        "client_id"   UUID        NOT NULL REFERENCES "users"("id"),
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "uq_mgr_cli" UNIQUE ("manager_id", "client_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "client_business_units" (
        "id"          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "client_id"   UUID         NOT NULL REFERENCES "users"("id"),
        "name"        VARCHAR(255) NOT NULL,
        "description" TEXT,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ
      )
    `);

    // 4. AI Configuration
    await queryRunner.query(`
      CREATE TABLE "ai_models" (
        "id"             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"           VARCHAR(255)  NOT NULL,
        "model_type"     "ai_model_type" NOT NULL,
        "endpoint_url"   TEXT          NOT NULL,
        "api_key_enc"    TEXT          NOT NULL,
        "is_active"      BOOLEAN       NOT NULL DEFAULT FALSE,
        "created_by"     UUID          NOT NULL REFERENCES "users"("id"),
        "created_at"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"     TIMESTAMPTZ
      )
    `);

    // 5. Template Library
    await queryRunner.query(`
      CREATE TABLE "audit_templates" (
        "id"          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"        VARCHAR(255) NOT NULL,
        "description" TEXT,
        "created_by"  UUID         NOT NULL REFERENCES "users"("id"),
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_template_line_items" (
        "id"            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "template_id"   UUID         NOT NULL REFERENCES "audit_templates"("id"),
        "name"          VARCHAR(500) NOT NULL,
        "description"   TEXT         NOT NULL,
        "input_method"  "input_method" NOT NULL,
        "is_optional"   BOOLEAN      NOT NULL DEFAULT FALSE,
        "display_order" INTEGER      NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_template_line_item_options" (
        "id"            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "line_item_id"  UUID         NOT NULL REFERENCES "audit_template_line_items"("id") ON DELETE CASCADE,
        "option_text"   VARCHAR(500) NOT NULL,
        "display_order" INTEGER      NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // 6. Audit Lifecycle
    await queryRunner.query(`
      CREATE TABLE "audits" (
        "id"                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"                     VARCHAR(500) NOT NULL,
        "client_id"                UUID         NOT NULL REFERENCES "users"("id"),
        "manager_id"               UUID         NOT NULL REFERENCES "users"("id"),
        "status"                   "audit_status" NOT NULL DEFAULT 'draft',
        "start_date"               DATE         NOT NULL,
        "expected_completion_date" DATE         NOT NULL,
        "description"              TEXT,
        "created_at"               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updated_at"               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "deleted_at"               TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_business_units" (
        "id"               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id"         UUID        NOT NULL REFERENCES "audits"("id"),
        "business_unit_id" UUID        NOT NULL REFERENCES "client_business_units"("id"),
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"       TIMESTAMPTZ,
        CONSTRAINT "uq_audit_bu" UNIQUE ("audit_id", "business_unit_id")
      )
    `);

    // 7. Scope & Responses
    await queryRunner.query(`
      CREATE TABLE "audit_scope_line_items" (
        "id"                     UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id"               UUID             NOT NULL REFERENCES "audits"("id"),
        "audit_business_unit_id" UUID             NOT NULL REFERENCES "audit_business_units"("id"),
        "name"                   VARCHAR(500)     NOT NULL,
        "description"            TEXT             NOT NULL,
        "input_method"           "input_method"     NOT NULL,
        "is_optional"            BOOLEAN          NOT NULL DEFAULT FALSE,
        "display_order"          INTEGER          NOT NULL DEFAULT 0,
        "source"                 "line_item_source" NOT NULL DEFAULT 'manual',
        "status"                 "line_item_status" NOT NULL DEFAULT 'not_started',
        "created_at"             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
        "updated_at"             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
        "deleted_at"             TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_scope_line_item_options" (
        "id"            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "line_item_id"  UUID         NOT NULL REFERENCES "audit_scope_line_items"("id") ON DELETE CASCADE,
        "option_text"   VARCHAR(500) NOT NULL,
        "display_order" INTEGER      NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auditor_audit_assignments" (
        "id"                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id"               UUID        NOT NULL REFERENCES "audits"("id"),
        "auditor_id"             UUID        NOT NULL REFERENCES "users"("id"),
        "audit_business_unit_id" UUID        NOT NULL REFERENCES "audit_business_units"("id"),
        "created_at"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"             TIMESTAMPTZ,
        CONSTRAINT "uq_aud_audit_bu" UNIQUE ("auditor_id", "audit_business_unit_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auditor_line_item_assignments" (
        "id"                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_scope_line_item_id" UUID        NOT NULL REFERENCES "audit_scope_line_items"("id"),
        "auditor_id"               UUID        NOT NULL REFERENCES "users"("id"),
        "created_at"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"             TIMESTAMPTZ,
        CONSTRAINT "uq_aud_li" UNIQUE ("audit_scope_line_item_id", "auditor_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "line_item_responses" (
        "id"                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_scope_line_item_id" UUID        NOT NULL REFERENCES "audit_scope_line_items"("id"),
        "auditor_id"               UUID        NOT NULL REFERENCES "users"("id"),
        "response_text"            TEXT,
        "selected_option_id"       UUID        REFERENCES "audit_scope_line_item_options"("id"),
        "comment"                  TEXT,
        "is_draft"                 BOOLEAN     NOT NULL DEFAULT TRUE,
        "submitted_at"             TIMESTAMPTZ,
        "created_at"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_lir" UNIQUE ("audit_scope_line_item_id", "auditor_id")
      )
    `);

    // 8. Files
    await queryRunner.query(`
      CREATE TABLE "uploaded_files" (
        "id"                UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
        "original_filename" VARCHAR(500)     NOT NULL,
        "stored_filename"   VARCHAR(500)     NOT NULL,
        "file_path"         TEXT             NOT NULL,
        "mime_type"         VARCHAR(100)     NOT NULL,
        "file_size_bytes"   INTEGER          NOT NULL CHECK ("file_size_bytes" <= 10485760),
        "uploaded_by"       UUID             NOT NULL REFERENCES "users"("id"),
        "entity_type"       "file_entity_type" NOT NULL,
        "entity_id"         UUID             NOT NULL,
        "created_at"        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ
      )
    `);

    // 9. Exceptions
    await queryRunner.query(`
      CREATE TABLE "exception_requests" (
        "id"                       UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_scope_line_item_id" UUID             NOT NULL REFERENCES "audit_scope_line_items"("id"),
        "auditor_id"               UUID             NOT NULL REFERENCES "users"("id"),
        "manager_id"               UUID             NOT NULL REFERENCES "users"("id"),
        "justification"            TEXT             NOT NULL,
        "status"                   "exception_status" NOT NULL DEFAULT 'pending',
        "manager_comment"          TEXT,
        "created_at"               TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
        "updated_at"               TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
        "resolved_at"              TIMESTAMPTZ
      )
    `);

    // 10. Reports
    await queryRunner.query(`
      CREATE TABLE "audit_reports" (
        "id"            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id"      UUID          NOT NULL REFERENCES "audits"("id"),
        "version"       INTEGER       NOT NULL DEFAULT 1,
        "status"        "report_status" NOT NULL DEFAULT 'draft',
        "generated_by"  UUID          REFERENCES "users"("id"),
        "file_id"       UUID          REFERENCES "uploaded_files"("id"),
        "ai_job_id"     UUID,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "client_report_feedback" (
        "id"              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_report_id" UUID            NOT NULL REFERENCES "audit_reports"("id"),
        "client_id"       UUID            NOT NULL REFERENCES "users"("id"),
        "section_name"    VARCHAR(255)    NOT NULL,
        "comment"         TEXT            NOT NULL,
        "status"          "feedback_status" NOT NULL DEFAULT 'pending',
        "created_at"      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      )
    `);

    // 11. Clarifications
    await queryRunner.query(`
      CREATE TABLE "clarification_requests" (
        "id"                   UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id"             UUID                 NOT NULL REFERENCES "audits"("id"),
        "manager_id"           UUID                 NOT NULL REFERENCES "users"("id"),
        "client_id"            UUID                 NOT NULL REFERENCES "users"("id"),
        "message"              TEXT                 NOT NULL,
        "status"               "clarification_status" NOT NULL DEFAULT 'pending',
        "related_exception_id" UUID                 REFERENCES "exception_requests"("id"),
        "created_at"           TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
        "updated_at"           TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
        "deleted_at"           TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "clarification_responses" (
        "id"                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "clarification_request_id" UUID        NOT NULL REFERENCES "clarification_requests"("id"),
        "responded_by"             UUID        NOT NULL REFERENCES "users"("id"),
        "message"                  TEXT        NOT NULL,
        "created_at"               TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // 12. Exceptional Actions
    await queryRunner.query(`
      CREATE TABLE "exceptional_action_requests" (
        "id"               UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id"         UUID                       NOT NULL REFERENCES "audits"("id"),
        "requested_by"     UUID                       NOT NULL REFERENCES "users"("id"),
        "action_type"      "exceptional_action_type"    NOT NULL,
        "justification"    TEXT                       NOT NULL,
        "status"           "exceptional_request_status" NOT NULL DEFAULT 'pending',
        "reviewed_by"      UUID                       REFERENCES "users"("id"),
        "admin_comment"    TEXT,
        "evidence_file_id" UUID                       REFERENCES "uploaded_files"("id"),
        "created_at"       TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        "updated_at"       TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        "resolved_at"      TIMESTAMPTZ
      )
    `);

    // 13. Notifications
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"             UUID              NOT NULL REFERENCES "users"("id"),
        "type"                "notification_type" NOT NULL,
        "title"               VARCHAR(500)      NOT NULL,
        "message"             TEXT              NOT NULL,
        "is_read"             BOOLEAN           NOT NULL DEFAULT FALSE,
        "related_entity_type" VARCHAR(100),
        "related_entity_id"   UUID,
        "created_at"          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
      )
    `);

    // 14. Audit Trail
    await queryRunner.query(`
      CREATE TABLE "audit_trail_logs" (
        "id"            UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
        "actor_user_id" UUID       REFERENCES "users"("id"),
        "actor_role"    "user_role",
        "action_type"   VARCHAR(100) NOT NULL,
        "entity_type"   VARCHAR(100) NOT NULL,
        "entity_id"     UUID,
        "payload"       JSONB,
        "ip_address"    INET,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE RULE no_update_audit_trail AS ON UPDATE TO audit_trail_logs DO INSTEAD NOTHING`,
    );
    await queryRunner.query(
      `CREATE RULE no_delete_audit_trail AS ON DELETE TO audit_trail_logs DO INSTEAD NOTHING`,
    );

    // 15. AI Jobs
    await queryRunner.query(`
      CREATE TABLE "ai_jobs" (
        "id"              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "job_type"        "job_type"    NOT NULL,
        "status"          "job_status"  NOT NULL DEFAULT 'queued',
        "input_payload"   JSONB       NOT NULL,
        "output_payload"  JSONB,
        "error_message"   TEXT,
        "audit_id"        UUID        REFERENCES "audits"("id"),
        "created_by"      UUID        NOT NULL REFERENCES "users"("id"),
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "completed_at"    TIMESTAMPTZ
      )
    `);

    // 16. Indexes
    await queryRunner.query(
      `CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_rt_user ON refresh_tokens(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_rt_hash ON refresh_tokens(token_hash)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_mam_mgr ON manager_auditor_mappings(manager_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_mam_aud ON manager_auditor_mappings(auditor_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_mcm_mgr ON manager_client_mappings(manager_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_mcm_cli ON manager_client_mappings(client_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_cbu_client ON client_business_units(client_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ai_active ON ai_models(is_active) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_atli_tpl ON audit_template_line_items(template_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_atlio_li ON audit_template_line_item_options(line_item_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audits_mgr ON audits(manager_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audits_cli ON audits(client_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audits_status ON audits(status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_abu_audit ON audit_business_units(audit_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_asli_audit ON audit_scope_line_items(audit_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_asli_abu ON audit_scope_line_items(audit_business_unit_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_asli_status ON audit_scope_line_items(status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_aslio_li ON audit_scope_line_item_options(line_item_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_aaa_audit ON auditor_audit_assignments(audit_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_aaa_auditor ON auditor_audit_assignments(auditor_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_alia_li ON auditor_line_item_assignments(audit_scope_line_item_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_alia_aud ON auditor_line_item_assignments(auditor_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_lir_li ON line_item_responses(audit_scope_line_item_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_lir_aud ON line_item_responses(auditor_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_uf_entity ON uploaded_files(entity_type, entity_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_uf_uploader ON uploaded_files(uploaded_by) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_er_li ON exception_requests(audit_scope_line_item_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_er_aud ON exception_requests(auditor_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_er_mgr ON exception_requests(manager_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_er_status ON exception_requests(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ar_audit ON audit_reports(audit_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ar_status ON audit_reports(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_crf_report ON client_report_feedback(audit_report_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_crf_client ON client_report_feedback(client_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_cr_audit ON clarification_requests(audit_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_cr_client ON clarification_requests(client_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_cr_status ON clarification_requests(status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_cres_req ON clarification_responses(clarification_request_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ear_audit ON exceptional_action_requests(audit_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ear_status ON exceptional_action_requests(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_notif_user ON notifications(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_notif_unread ON notifications(user_id, is_read) WHERE is_read = FALSE`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_atl_actor ON audit_trail_logs(actor_user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_atl_entity ON audit_trail_logs(entity_type, entity_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_atl_created ON audit_trail_logs(created_at)`,
    );
    await queryRunner.query(`CREATE INDEX idx_aj_audit ON ai_jobs(audit_id)`);
    await queryRunner.query(`CREATE INDEX idx_aj_status ON ai_jobs(status)`);
    await queryRunner.query(
      `CREATE INDEX idx_aj_created_by ON ai_jobs(created_by)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop logic in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_jobs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_trail_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "exceptional_action_requests" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "clarification_responses" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "clarification_requests" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "client_report_feedback" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_reports" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "exception_requests" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "uploaded_files" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "line_item_responses" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "auditor_line_item_assignments" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "auditor_audit_assignments" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "audit_scope_line_item_options" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "audit_scope_line_items" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "audit_business_units" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "audits" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "audit_template_line_item_options" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "audit_template_line_items" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_templates" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_models" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "client_business_units" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "manager_client_mappings" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "manager_auditor_mappings" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

    // Drop Enums
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "job_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "job_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "exceptional_request_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "exceptional_action_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "clarification_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "feedback_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "report_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "file_entity_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "exception_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "line_item_source"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "line_item_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "audit_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "input_method"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ai_model_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}

import type { User } from '../stores/auth';

export type AuditStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'under_manager_review' 
  | 'pending_client_review' 
  | 'closed' 
  | 'reopened' 
  | 'archived'
  | 'deleted';

export const AuditStatus = {
  DRAFT: 'draft' as AuditStatus,
  IN_PROGRESS: 'in_progress' as AuditStatus,
  UNDER_MANAGER_REVIEW: 'under_manager_review' as AuditStatus,
  PENDING_CLIENT_REVIEW: 'pending_client_review' as AuditStatus,
  CLOSED: 'closed' as AuditStatus,
  REOPENED: 'reopened' as AuditStatus,
  ARCHIVED: 'archived' as AuditStatus,
  DELETED: 'deleted' as AuditStatus,
};

export interface BusinessUnit {
  id: string;
  name: string;
  description?: string;
  clientId: string;
}

export interface Assignment {
  id: string;
  auditId: string;
  auditorId: string;
  auditor: User;
  auditBusinessUnitId: string;
}

export interface Audit {
  id: string;
  name: string;
  clientId: string;
  client?: User;
  managerId: string;
  manager?: User;
  status: AuditStatus;
  description?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Computed/Enriched fields
  auditorCount?: number;
  completionPercentage?: number;
  openExceptionsCount?: number;
  hasPendingExceptionalRequest?: boolean;
  businessUnits?: BusinessUnit[];
  assignments?: Assignment[];
}

export interface CreateAuditDto {
  name: string;
  clientId: string;
  businessUnitIds: string[];
  startDate: string;
  expectedCompletionDate: string;
  description?: string;
}

export interface UpdateAuditDto {
  name?: string;
  expectedCompletionDate?: string;
  description?: string;
}

export interface AuditListResponse {
  items: Audit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

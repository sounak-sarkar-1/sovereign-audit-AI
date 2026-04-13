export type InputMethod = 'free_text' | 'multiple_choice';

export type LineItemSource =
  | 'manual'
  | 'ai_extracted'
  | 'excel_imported'
  | 'template';

export type LineItemStatus =
  | 'not_started'
  | 'draft_saved'
  | 'submitted'
  | 'exception_pending'
  | 'exception_approved'
  | 'exception_rejected'
  | 'returned';

export interface ScopeLineItemOption {
  id: string;
  lineItemId: string;
  optionText: string;
  displayOrder: number;
}

export interface ScopeLineItem {
  id: string;
  auditId: string;
  auditBusinessUnitId: string;
  name: string;
  description: string;
  inputMethod: InputMethod;
  isOptional: boolean;
  displayOrder: number;
  source: LineItemSource;
  status: LineItemStatus;
  weightage: number | null;
  options?: ScopeLineItemOption[];
  auditBusinessUnit?: any;
  createdAt: string;
  updatedAt: string;
}

export interface LineItemResponse {
  id: string;
  auditScopeLineItemId: string;
  auditorId: string;
  responseText?: string;
  selectedOptionId?: string;
  comment?: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeLineItemExtended extends ScopeLineItem {
  ownResponse?: LineItemResponse;
}


export interface AiJob {
  id: string;
  jobType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  inputPayload: any;
  outputPayload?: {
    items: Array<{
      name: string;
      description: string;
      inputMethod: string;
      options?: string[];
    }>;
  };
  errorMessage?: string;
  auditId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ImportSession {
  importId: string;
  detectedColumns: Array<{
    columnLetter: string;
    headerText: string;
  }>;
}

export interface ImportFromTemplateDto {
  templateIds: string[];
  auditBusinessUnitId: string;
}

export interface ConfirmExcelImportDto {
  columnMapping: {
    nameColumn: string;
    descriptionColumn: string;
    inputMethodColumn?: string;
  };
}

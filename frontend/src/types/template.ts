export type InputMethod = 'free_text' | 'multiple_choice';

export interface AuditTemplateOption {
  id?: string;
  lineItemId?: string;
  optionText: string;
  displayOrder: number;
}

export interface AuditTemplateLineItem {
  id?: string;
  templateId?: string;
  name: string;
  description: string;
  inputMethod: InputMethod;
  isOptional: boolean;
  displayOrder: number;
  options?: AuditTemplateOption[];
}

export interface AuditTemplate {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lineItems?: AuditTemplateLineItem[];
}

export interface CreateAuditTemplateDto {
  name: string;
  description?: string;
  lineItems: Omit<AuditTemplateLineItem, 'id' | 'templateId'>[];
}

export interface UpdateAuditTemplateDto extends Partial<CreateAuditTemplateDto> {}

export interface TemplateListResponse {
  items: AuditTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import api from '../lib/api';
import type {
  AuditTemplate,
  TemplateListResponse,
  CreateAuditTemplateDto,
  UpdateAuditTemplateDto,
} from '../types/template';

export const templateService = {
  getTemplates: async (
    page = 1,
    limit = 10,
    search = '',
  ): Promise<TemplateListResponse> => {
    const response = await api.get('/admin/templates', {
      params: { page, limit, search },
    });
    return response;
  },

  getTemplate: async (id: string): Promise<AuditTemplate> => {
    const response = await api.get(`/admin/templates/${id}`);
    return response;
  },

  createTemplate: async (
    data: CreateAuditTemplateDto,
  ): Promise<AuditTemplate> => {
    const response = await api.post('/admin/templates', data, {
      timeout: 10000,
    });
    return response;
  },

  updateTemplate: async (
    id: string,
    data: UpdateAuditTemplateDto,
  ): Promise<AuditTemplate> => {
    const response = await api.put(`/admin/templates/${id}`, data);
    return response;
  },

  deleteTemplate: async (
    id: string,
  ): Promise<{ message: string; warningCount: number }> => {
    const response = await api.delete(`/admin/templates/${id}`);
    return response;
  },
};

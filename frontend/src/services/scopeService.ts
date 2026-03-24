import api from '../lib/api';
import type {
  ScopeLineItem,
  ImportFromTemplateDto,
  AiJob,
  ImportSession,
  ConfirmExcelImportDto,
} from '../types/scope';

export const scopeService = {
  getScope: async (
    auditId: string,
  ): Promise<Record<string, ScopeLineItem[]>> => {
    const response = await api.get(`/manager/audits/${auditId}/scope`);
    return response.data;
  },

  createLineItems: async (auditId: string, data: any) => {
    const response = await api.post(
      `/manager/audits/${auditId}/scope/line-items`,
      data,
    );
    return response.data;
  },

  updateLineItem: async (auditId: string, itemId: string, data: any) => {
    const response = await api.put(
      `/manager/audits/${auditId}/scope/line-items/${itemId}`,
      data,
    );
    return response.data;
  },

  deleteLineItem: async (auditId: string, itemId: string) => {
    const response = await api.delete(
      `/manager/audits/${auditId}/scope/line-items/${itemId}`,
    );
    return response.data;
  },

  importFromTemplate: async (auditId: string, data: ImportFromTemplateDto) => {
    const response = await api.post(
      `/manager/audits/${auditId}/scope/import-from-template`,
      data,
    );
    return response.data;
  },

  extractFromDocument: async (
    auditId: string,
    file: File,
    auditBusinessUnitId: string,
  ): Promise<{ jobId: string }> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('auditBusinessUnitId', auditBusinessUnitId);
    const response = await api.post(
      `/manager/audits/${auditId}/scope/extract-from-document`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  importFromExcel: async (
    auditId: string,
    file: File,
    auditBusinessUnitId: string,
  ): Promise<ImportSession> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auditBusinessUnitId', auditBusinessUnitId);
    const response = await api.post(
      `/manager/audits/${auditId}/scope/import-from-excel`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  confirmExcelImport: async (
    auditId: string,
    importId: string,
    dto: ConfirmExcelImportDto,
  ) => {
    const response = await api.post(
      `/manager/audits/${auditId}/scope/import-from-excel/${importId}/confirm`,
      dto,
    );
    return response.data;
  },

  getAiJob: async (jobId: string): Promise<AiJob> => {
    const response = await api.get(`/ai-jobs/${jobId}`);
    return response.data;
  },
};

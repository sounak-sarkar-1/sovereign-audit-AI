import api from '../lib/api';

export const FileEntityType = {
  LINE_ITEM_EVIDENCE: 'line_item_evidence',
  EXCEPTION_EVIDENCE: 'exception_evidence',
  SOP_DOCUMENT: 'sop_document',
  AUDIT_REPORT: 'audit_report',
  EXCEPTIONAL_ACTION_EVIDENCE: 'exceptional_action_evidence',
  CLARIFICATION_ATTACHMENT: 'clarification_attachment',
} as const;

export type FileEntityType = typeof FileEntityType[keyof typeof FileEntityType];

export interface UploadedFile {
  id: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy: string;
  entityType: FileEntityType;
  entityId?: string;
  annotations?: any;
  createdAt: string;
}

export const fileService = {
  uploadFile: async (file: File, entityType: FileEntityType, entityId?: string): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    const response = await api.post('/shared/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  updateAnnotations: async (id: string, annotations: any): Promise<UploadedFile> => {
    const response = await api.patch(`/shared/files/${id}/annotations`, { annotations });
    return response;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/shared/files/${id}`);
  },

  getFile: async (id: string): Promise<UploadedFile> => {
    const response = await api.get(`/shared/files/${id}`);
    return response;
  },
};

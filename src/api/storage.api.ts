import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

export interface UploadFile {
    uri: string;
    name: string;
    type: string;
}

const sanitizeFileName = (name: string): string =>
    name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');

export const storageApi = {
    upload: async (file: UploadFile, folder: string): Promise<string> => {
        const form = new FormData();
        form.append('file', { uri: file.uri, name: sanitizeFileName(file.name), type: file.type } as any);
        form.append('folder', folder);
        const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
            API_ENDPOINTS.STORAGE_UPLOAD,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data.url;
    },

    uploadMultiple: async (files: UploadFile[], folder: string): Promise<string[]> => {
        const form = new FormData();
        files.forEach((file) => {
            form.append('file', { uri: file.uri, name: sanitizeFileName(file.name), type: file.type } as any);
        });
        form.append('folder', folder);
        const response = await apiClient.post<{ success: boolean; data: { urls: string[] } }>(
            API_ENDPOINTS.STORAGE_UPLOAD,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data.urls;
    },
};

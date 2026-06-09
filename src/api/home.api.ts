import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';
import type { ApiAppContent } from '../types/home';

export const homeApi = {
    getAppContents: async (): Promise<ApiAppContent> => {
        const response = await apiClient.get(API_ENDPOINTS.APP_CONTENTS);
        return response.data.data;
    },
};

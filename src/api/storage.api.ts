import { API_ENDPOINTS, UPLOAD_TIMEOUT } from "../utils/urls";
import { apiClient } from "./client";
import { logger } from "@/src/utils/logger";

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

/** Uploaded asset detail */
export interface UploadedImage {
  url: string;
  path: string;
}

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");

// Extract path key from URL as fallback if not returned
export const deriveKeyFromUrl = (url: string): string => {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return url;
  }
};

export const storageApi = {
  // Uploads a single file to storage
  upload: async (
    file: UploadFile,
    folder: string,
    options?: {
      onProgress?: (percent: number) => void;
      signal?: AbortSignal;
    },
  ): Promise<UploadedImage> => {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: sanitizeFileName(file.name),
      type: file.type,
      // React Native FormData requires file descriptor cast
    } as unknown as Blob);
    form.append("folder", folder);
    const response = await apiClient.post<{
      success: boolean;
      data: { url: string; path?: string; key?: string };
    }>(API_ENDPOINTS.STORAGE_UPLOAD, form, {
      headers: { "Content-Type": "multipart/form-data" },
      // Longer timeout for larger file uploads
      timeout: UPLOAD_TIMEOUT,
      signal: options?.signal,
      onUploadProgress: options?.onProgress
        ? (e) => {
            if (!e.total) return;
            options.onProgress?.(Math.round((e.loaded / e.total) * 100));
          }
        : undefined,
    });
    const data = response.data.data;
    // Log response and extract deletion key
    if (__DEV__)
      logger.debug(
        "[storageApi.upload] raw response.data:",
        JSON.stringify(response.data),
      );
    return {
      url: data.url,
      path: data.path ?? data.key ?? deriveKeyFromUrl(data.url),
    };
  },

  // Deletes file by path key
  delete: async (path: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.STORAGE_DELETE, {
      data: { key: path },
    });
  },

  uploadMultiple: async (
    files: UploadFile[],
    folder: string,
  ): Promise<string[]> => {
    const form = new FormData();
    files.forEach((file) => {
      form.append("file", {
        uri: file.uri,
        name: sanitizeFileName(file.name),
        type: file.type,
        // React Native FormData requires file descriptor cast
      } as unknown as Blob);
    });
    form.append("folder", folder);
    const response = await apiClient.post<{
      success: boolean;
      data: { urls: string[] };
    }>(API_ENDPOINTS.STORAGE_UPLOAD, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.urls;
  },
};

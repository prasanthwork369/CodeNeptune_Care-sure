import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

/** An uploaded asset: `url` for display, `path` (bucket-relative key) for deletion. */
export interface UploadedImage {
  url: string;
  path: string;
}

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");

// Falls back to the URL's path when the backend doesn't return an explicit
// path/key, so deletion still has a best-effort key to work with.
export const deriveKeyFromUrl = (url: string): string => {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return url;
  }
};

export const storageApi = {
  // Returns both the display URL and the bucket-relative `path`. Mirrors the
  // web ImageUpload, which stores `path` (the delete key) and previews `url`.
  upload: async (file: UploadFile, folder: string): Promise<UploadedImage> => {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: sanitizeFileName(file.name),
      type: file.type,
    } as any);
    form.append("folder", folder);
    const response = await apiClient.post<{
      success: boolean;
      data: { url: string; path?: string; key?: string };
    }>(API_ENDPOINTS.STORAGE_UPLOAD, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = response.data.data;
    // TEMP: confirm the exact field the backend returns for the delete key
    // (doc calls it the "path returned in upload response metadata").
    if (__DEV__)
      console.log(
        "[storageApi.upload] raw response.data:",
        JSON.stringify(response.data),
      );
    return {
      url: data.url,
      path: data.path ?? data.key ?? deriveKeyFromUrl(data.url),
    };
  },

  // Deletes a previously uploaded asset by its bucket-relative path/key.
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
      } as any);
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

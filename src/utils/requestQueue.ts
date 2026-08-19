import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosRequestConfig, AxiosResponse } from "axios";

const STORAGE_KEY = "offline_request_queue";
const MAX_SIZE = 50;

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse) => void;
  reject: (reason?: unknown) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];

  async loadFromStorage(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const configs: AxiosRequestConfig[] = JSON.parse(raw);
      configs.forEach((config) => {
        if (this.queue.length < MAX_SIZE) {
          this.queue.push({ config, resolve: () => {}, reject: () => {} });
        }
      });
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }

  async add(
    config: AxiosRequestConfig,
    resolve: QueuedRequest["resolve"],
    reject: QueuedRequest["reject"],
  ): Promise<void> {
    // Fold duplicate requests with the same method/URL/body to prevent double writes
    const duplicate = this.queue.find(
      (r) =>
        r.config.method === config.method &&
        r.config.url === config.url &&
        JSON.stringify(r.config.data) === JSON.stringify(config.data),
    );
    if (duplicate) {
      const prevResolve = duplicate.resolve;
      const prevReject = duplicate.reject;
      duplicate.resolve = (value) => {
        prevResolve(value);
        resolve(value);
      };
      duplicate.reject = (reason) => {
        prevReject(reason);
        reject(reason);
      };
      return;
    }

    if (this.queue.length >= MAX_SIZE) {
      reject(new Error("Offline queue full — request dropped"));
      return;
    }
    this.queue.push({ config, resolve, reject });
    await this._persist();
  }

  // Accepts callable AxiosInstance or mock stub
  async process(
    axiosInstance: (config: AxiosRequestConfig) => Promise<AxiosResponse>,
  ): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];
    await AsyncStorage.removeItem(STORAGE_KEY);

    for (const req of batch) {
      try {
        const response = await axiosInstance(req.config);
        req.resolve(response);
      } catch (err) {
        req.reject(err);
      }
    }
  }

  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  get length(): number {
    return this.queue.length;
  }

  private async _persist(): Promise<void> {
    try {
      const configs = this.queue.map((r) => r.config);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    } catch {
      // Non-fatal persistence error
    }
  }
}

export const requestQueue = new RequestQueue();

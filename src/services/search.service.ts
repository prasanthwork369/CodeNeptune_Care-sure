import { searchApi } from "../api/search.api";

export const searchService = {
  medicines: (query: string, page?: number, limit?: number) =>
    searchApi.searchMedicines(query, page, limit),
  getSuggestions: (query: string, limit?: number) =>
    searchApi.getSuggestions(query, limit),
  getHistory: (limit?: number, offset?: number) =>
    searchApi.getHistory(limit, offset),
  recordHistory: (query: string, productId?: string) =>
    searchApi.recordHistory(query, productId),
  clearHistory: () => searchApi.clearHistory(),
  deleteHistoryItem: (id: string) => searchApi.deleteHistoryItem(id),
  getTrending: (limit?: number) => searchApi.getTrending(limit),
};

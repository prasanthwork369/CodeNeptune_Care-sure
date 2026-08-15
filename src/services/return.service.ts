import { returnApi } from "../api/return.api";
import { CreateReturnRequest, ReturnRecord } from "@/src/features/orders/return.types";

export const returnService = {
  createReturn: (data: CreateReturnRequest): Promise<ReturnRecord> =>
    returnApi.createReturn(data),
  getReturnById: (id: string): Promise<ReturnRecord> =>
    returnApi.getReturnById(id),
  listReturns: (params?: Record<string, unknown>): Promise<ReturnRecord[]> =>
    returnApi.listReturns(params),
};

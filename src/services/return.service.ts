import { returnApi } from '../api/return.api';
import { CreateReturnRequest, ReturnRecord } from '../types/return';

export const returnService = {
    createReturn: (data: CreateReturnRequest): Promise<ReturnRecord> => returnApi.createReturn(data),
    getReturnById: (id: string): Promise<ReturnRecord> => returnApi.getReturnById(id),
    listReturns: (params?: Record<string, any>): Promise<ReturnRecord[]> => returnApi.listReturns(params),
};

export interface ReturnItemImages {
  front?: string;
  back?: string;
  packaging?: string;
  issue?: string;
}

export interface ConfirmedReturnItem {
  orderItemId: string;
  medicineId: string;
  quantity: number;
  reason: string;
  images: ReturnItemImages;
  details?: string;
  name: string;
  unitPrice: number;
  total: number;
  thumbnailUrl?: string;
}

export interface CreateReturnRequest {
  orderId: string;
  refundMethod: number;
  items: {
    orderItemId: string;
    medicineId: string;
    quantity: number;
    reason: string;
    images: ReturnItemImages;
    details?: string;
  }[];
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  refundMethod: number;
  status: number;
  createdAt: string;
  items: ConfirmedReturnItem[];
}

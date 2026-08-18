/** One place suggestion from search-as-you-type. */
export interface LocationPrediction {
  description: string;
  placeId: string;
}

/** The pincode record behind a resolved location — every field is optional, as on web. */
export interface ResolvedArea {
  id?: string;
  pincodeNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: number;
}

/** A place or coordinate pair resolved to a pincode and its serviceability. */
export interface ResolvedLocation {
  pincode: string;
  formattedAddress: string;
  serviceable: boolean;
  area?: ResolvedArea;
}

export interface PincodeArea {
  id: string;
  pincodeNumber: string;
  city: string;
  country: string;
  status: number;
}

export interface PincodeCheckResponse {
  serviceable: boolean;
  area?: PincodeArea;
}

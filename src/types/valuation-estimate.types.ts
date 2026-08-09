export interface FloorBreakdownEntry {
  floor: string | number;
  areaSqFt: number;
  [key: string]: unknown;
}

export interface ValuationEstimate {
  id: string;
  ownerName: string;
  address: string;
  plotAreaSqFt: number;
  plotAreaSqM: number;
  estimatedAmount: number;
  rate: number;
  coveragePercent: number;
  totalPermissibleAreaSqFt: number;
  groundFloorAreaSqFt: number;
  floorBreakdown: FloorBreakdownEntry[];
  createdBy: string;
  creator?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ListValuationEstimatesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  createdBy?: string;
}

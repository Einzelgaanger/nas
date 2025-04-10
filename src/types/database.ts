
export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Region {
  id: string;
  name: string;
  created_at: string;
}

export interface Disburser {
  id: string;
  name: string;
  phone_number: string;
  password: string;
  region_id: string;
  created_at: string;
  updated_at: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  height?: number;
  estimated_age?: number;
  unique_identifiers: Record<string, any>;
  registered_by: string;
  region_id: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface RegionalGoods {
  id: string;
  goods_type_id: string;
  region_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Allocation {
  id: string;
  beneficiary_id: string;
  disburser_id: string;
  goods: Record<string, any>;
  location: Record<string, any>;
  allocated_at: string;
}

export interface FraudAlert {
  id: string;
  beneficiary_id: string;
  disburser_id: string;
  location: Record<string, any>;
  details?: string;
  attempted_at: string;
}

export interface LoginRequest {
  username?: string;
  phone_number?: string;
  password: string;
  role: 'admin' | 'disburser';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: Admin | Disburser;
  role?: 'admin' | 'disburser';
}

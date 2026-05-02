export type Role = 'admin' | 'user'

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: Role
  status: 'pending' | 'approved' | 'rejected' | 'disabled'
  must_change_password: boolean
  created_at: string
  updated_at: string
  assigned_vehicles?: Vehicle[]
}

export type VehicleStatus = 'available' | 'assigned' | 'maintenance'

export interface Vehicle {
  id: string
  license_plate: string
  brand: string
  model: string
  year: number
  color?: string
  fuel_type?: string
  status: VehicleStatus
  mileage?: number
  notes?: string
  assigned_to_id?: string
  assigned_to?: User
  assigned_at?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  refresh_token: string
  user: User
  must_change_password: boolean
}

export interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateVehicleDto {
  license_plate: string
  brand: string
  model: string
  year: number
  color?: string
  fuel_type?: string
  mileage?: number
  notes?: string
}

export interface UpdateVehicleDto {
  license_plate?: string
  brand?: string
  model?: string
  year?: number
  color?: string
  fuel_type?: string
  mileage?: number
  notes?: string
}

export interface Brand {
  ID: number
  Name: string
}

export interface Model {
  ID: number
  Name: string
  BrandID: number
}

export interface VehicleAssignment {
  id: string
  vehicle_id: string
  user_id: string
  started_at: string
  ended_at?: string | null
  notes?: string
  vehicle?: Vehicle
  user?: User
  created_at: string
  updated_at: string
}

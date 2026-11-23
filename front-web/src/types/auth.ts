export type Role = 'pet_owner' | 'host_caregiver' | 'store_owner' | 'admin';

export interface User {
  _id: string;
  name: string;
  phone: string;
  roles: Role[];
  hasPet?: boolean;
  canHost?: boolean;
  isActive?: boolean;
}

export interface LoginCredentials {
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

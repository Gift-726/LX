/**
 * Common types and interfaces for LX Backend
 */

// Common API Response structure
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Pagination response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Error response
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  field?: string;
  expired?: boolean;
  redirectTo?: string;
  requiresVerification?: boolean;
  socialLogin?: boolean;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Common filter parameters
export interface FilterParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  category?: string;
}

import type { Request } from "express"
import type { JwtPayload } from "jsonwebtoken"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export interface JwtTokenPayload extends JwtPayload {
  userId: string
  email: string
  role: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

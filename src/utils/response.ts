import type { Response } from "express"
import type { ApiResponse, PaginatedResponse } from "@/types"

export class ResponseUtil {
  static success<T>(res: Response, message: string, data?: T, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...data,
    }
    return res.status(statusCode).json(response)
  }

  static error(res: Response, message: string, error?: string, statusCode = 400): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
    }
    return res.status(statusCode).json(response)
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number,
    statusCode = 200,
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
    return res.status(statusCode).json(response)
  }
}

import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", "),
    })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: "Conflict error",
          error: "A record with this data already exists",
        })
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "Not found",
          error: "Record not found",
        })
      default:
        return res.status(400).json({
          success: false,
          message: "Database error",
          error: error.message,
        })
    }
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Authentication error",
      error: "Invalid token",
    })
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication error",
      error: "Token expired",
    })
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
}

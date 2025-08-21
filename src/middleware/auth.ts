import type { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "@/config/environment"
import type { AuthenticatedRequest, JwtTokenPayload } from "@/types"
import { ResponseUtil } from "@/utils/response"

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return ResponseUtil.error(res, "Token de acesso necessário", undefined, 401)
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtTokenPayload
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
    return next()
  } catch (error) {
    return ResponseUtil.error(res, "Invalid or expired token", undefined, 403)
  }
}

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.error(res, "Authentication required", undefined, 401)
    }

    if (!roles.includes(req.user.role)) {
      return ResponseUtil.error(res, "Não possui Permissão", undefined, 403)
    }

    return next()
  }
}

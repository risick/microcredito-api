import type { Request, Response, NextFunction } from "express"
import { AuthService } from "@/services/auth.service"
import { registerSchema, loginSchema } from "@/schemas/auth"
import { ResponseUtil } from "@/utils/response"
import type { AuthenticatedRequest } from "@/types"

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body)
      const result = await AuthService.register(validatedData)

      return ResponseUtil.success(res, "Usuário registrado com sucesso", result, 201)
    } catch (error) {
      return next(error)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body)
      const result = await AuthService.login(validatedData)

      return ResponseUtil.success(res, "Login realizado com sucesso", result)
    } catch (error) {
      return next(error)
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, "Usuário não autenticado", undefined, 401)
      }

      const user = await AuthService.getUserById(req.user.id)
      return ResponseUtil.success(res, "Perfil do usuário", user)
    } catch (error) {
      return next(error)
    }
  }

  static async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, "Usuário não autenticado", undefined, 401)
      }

      const token = AuthService.generateToken({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
      })

      return ResponseUtil.success(res, "Token renovado com sucesso", { token })
    } catch (error) {
      return next(error)
    }
  }
}

import type { Request, Response, NextFunction } from "express"
import { BorrowerService } from "@/services/borrower.service"
import { createBorrowerSchema, updateBorrowerSchema, borrowerQuerySchema } from "@/schemas/borrower"
import { ResponseUtil } from "@/utils/response"
import { validatePagination } from "@/utils/validation"
import type { AuthenticatedRequest } from "@/types"

export class BorrowerController {
  static async createBorrower(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createBorrowerSchema.parse(req.body)

      // Se o usuário não é admin, usar seu próprio ID
      let userId = validatedData.userId
      if (req.user?.role !== "ADMIN") {
        userId = req.user?.id
      }

      const borrower = await BorrowerService.createBorrower(validatedData, userId)

      return ResponseUtil.success(res, "Perfil de cliente criado com sucesso", borrower, 201)
    } catch (error) {
      return next(error)
    }
  }

  static async getBorrowers(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = validatePagination(req.query)
      const filters = borrowerQuerySchema.parse(req.query)

      const { borrowers, total } = await BorrowerService.getBorrowers(filters, pagination)

      return ResponseUtil.paginated(res, "Lista de clientes", borrowers, pagination.page, pagination.limit, total)
    } catch (error) {
      return next(error)
    }
  }

  static async getBorrowerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const borrower = await BorrowerService.getBorrowerById(id)

      return ResponseUtil.success(res, "Dados do cliente", borrower)
    } catch (error) {
      return next(error)
    }
  }

  static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, "Usuário não autenticado", undefined, 401)
      }

      const borrower = await BorrowerService.getBorrowerByUserId(req.user.id)

      return ResponseUtil.success(res, "Meu perfil de cliente", borrower)
    } catch (error) {
      return next(error)
    }
  }

  static async updateBorrower(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const validatedData = updateBorrowerSchema.parse(req.body)

      const borrower = await BorrowerService.updateBorrower(id, validatedData)

      return ResponseUtil.success(res, "Cliente atualizado com sucesso", borrower)
    } catch (error) {
      return next(error)
    }
  }

  static async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, "Usuário não autenticado", undefined, 401)
      }

      const validatedData = updateBorrowerSchema.parse(req.body)

      // Buscar o borrower do usuário atual
      const existingBorrower = await BorrowerService.getBorrowerByUserId(req.user.id)

      const borrower = await BorrowerService.updateBorrower(existingBorrower.id, validatedData)

      return ResponseUtil.success(res, "Perfil atualizado com sucesso", borrower)
    } catch (error) {
      return next(error)
    }
  }

  static async deleteBorrower(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await BorrowerService.deleteBorrower(id)

      return ResponseUtil.success(res, "Cliente desativado com sucesso")
    } catch (error) {
      return next(error)
    }
  }

  static async getBorrowerStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await BorrowerService.getBorrowerStats()

      return ResponseUtil.success(res, "Estatísticas de clientes", stats)
    } catch (error) {
      return next(error)
    }
  }

  static async recalculateCreditScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      // Buscar borrower
      const borrower = await BorrowerService.getBorrowerById(id)

      // Recalcular score
      const updatedBorrower = await BorrowerService.updateBorrower(id, {
        creditScore: undefined, // Isso forçará o recálculo
        income: borrower.income.toNumber(),
      })

      return ResponseUtil.success(res, "Score de crédito recalculado", updatedBorrower)
    } catch (error) {
      return next(error)
    }
  }
}

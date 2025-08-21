import type { Request, Response, NextFunction } from "express"
import { prisma } from "@/config/database"
import { updateUserSchema } from "@/schemas/auth"
import { ResponseUtil } from "@/utils/response"
import { validatePagination } from "@/utils/validation"
import type { AuthenticatedRequest } from "@/types"

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = validatePagination(req.query)
      const { search, role, isActive } = req.query

      // Construir filtros
      const where: any = {}

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ]
      }

      if (role) {
        where.role = role
      }

      if (isActive !== undefined) {
        where.isActive = isActive === "true"
      }

      // Buscar usuários com paginação
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ])

      return ResponseUtil.paginated(res, "Lista de usuários", users, page, limit, total)
    } catch (error) {
      next(error)
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          borrower: {
            select: {
              id: true,
              bi: true,
              phone: true,
              city: true,
              state: true,
            },
          },
        },
      })

      if (!user) {
        return ResponseUtil.error(res, "Usuário não encontrado", undefined, 404)
      }

      return ResponseUtil.success(res, "Dados do usuário", user)
    } catch (error) {
      next(error)
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const validatedData = updateUserSchema.parse(req.body)

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseUtil.error(res, "Usuário não encontrado", undefined, 404)
      }

      // Verificar se o email já está em uso por outro usuário
      if (validatedData.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: id },
          },
        })

        if (emailExists) {
          return ResponseUtil.error(res, "Email já está em uso", undefined, 409)
        }
      }

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id },
        data: validatedData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return ResponseUtil.success(res, "Usuário atualizado com sucesso", updatedUser)
    } catch (error) {
      next(error)
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseUtil.error(res, "Usuário não encontrado", undefined, 404)
      }

      // Soft delete - desativar usuário
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      })

      return ResponseUtil.success(res, "Usuário desativado com sucesso")
    } catch (error) {
      next(error)
    }
  }

  static async getUserStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      })

      const totalUsers = await prisma.user.count()
      const activeUsers = await prisma.user.count({
        where: { isActive: true },
      })

      const formattedStats = {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: stats.reduce(
          (acc, stat) => {
            acc[stat.role] = stat._count.id
            return acc
          },
          {} as Record<string, number>,
        ),
      }

      return ResponseUtil.success(res, "Estatísticas de usuários", formattedStats)
    } catch (error) {
      next(error)
    }
  }
}

import { prisma } from "@/config/database"
import type { CreateBorrowerInput, UpdateBorrowerInput, BorrowerQueryInput } from "@/schemas/borrower"
import type { PaginationParams } from "@/types"

export class BorrowerService {
  static async createBorrower(data: CreateBorrowerInput, userId?: string) {
    // Se userId não foi fornecido, usar o do data
    const finalUserId = userId || data.userId

    if (!finalUserId) {
      throw new Error("ID do usuário é obrigatório")
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: finalUserId },
    })

    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    // Verificar se já existe um borrower para este usuário
    const existingBorrower = await prisma.borrower.findUnique({
      where: { userId: finalUserId },
    })

    if (existingBorrower) {
      throw new Error("Já existe um perfil de cliente para este usuário")
    }

    // Verificar se bi já está em uso
    const existingBi = await prisma.borrower.findUnique({
      where: { bi: data.bi },
    })

    if (existingBi) {
      throw new Error("Bi já está cadastrado")
    }

    // Calcular score de crédito se não fornecido
    let creditScore = data.creditScore
    if (!creditScore) {
      creditScore = await this.calculateCreditScore(data)
    }

    // Converter birthDate se for string
    const birthDate = typeof data.birthDate === "string" ? new Date(data.birthDate) : data.birthDate

    // Criar borrower
    const borrower = await prisma.borrower.create({
      data: {
        userId: finalUserId,
        bi: data.bi,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        birthDate,
        income: data.income,
        creditScore,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return borrower
  }

  static async getBorrowers(filters: BorrowerQueryInput, pagination: PaginationParams) {
    const { page, limit, skip } = pagination

    // Construir filtros
    const where: any = {}

    if (filters.search) {
      where.OR = [
        { bi: { contains: filters.search, mode: "insensitive" } },
        { user: { name: { contains: filters.search, mode: "insensitive" } } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
        { city: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: "insensitive" }
    }

    if (filters.state) {
      where.state = filters.state
    }

    if (filters.minIncome || filters.maxIncome) {
      where.income = {}
      if (filters.minIncome) where.income.gte = filters.minIncome
      if (filters.maxIncome) where.income.lte = filters.maxIncome
    }

    if (filters.minCreditScore || filters.maxCreditScore) {
      where.creditScore = {}
      if (filters.minCreditScore) where.creditScore.gte = filters.minCreditScore
      if (filters.maxCreditScore) where.creditScore.lte = filters.maxCreditScore
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    // Buscar borrowers com paginação
    const [borrowers, total] = await Promise.all([
      prisma.borrower.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          _count: {
            select: {
              loans: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.borrower.count({ where }),
    ])

    return { borrowers, total }
  }

  static async getBorrowerById(id: string) {
    const borrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
        loans: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!borrower) {
      throw new Error("Cliente não encontrado")
    }

    return borrower
  }

  static async getBorrowerByUserId(userId: string) {
    const borrower = await prisma.borrower.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        loans: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!borrower) {
      throw new Error("Perfil de cliente não encontrado")
    }

    return borrower
  }

  static async updateBorrower(id: string, data: UpdateBorrowerInput) {
    // Verificar se o borrower existe
    const existingBorrower = await prisma.borrower.findUnique({
      where: { id },
    })

    if (!existingBorrower) {
      throw new Error("Cliente não encontrado")
    }

    // Verificar se bi já está em uso por outro borrower
    if (data.bi) {
      const existingBi = await prisma.borrower.findFirst({
        where: {
          bi: data.bi,
          id: { not: id },
        },
      })

      if (existingBi) {
        throw new Error("Bi já está cadastrado")
      }
    }

    // Converter birthDate se for string
    const updateData = { ...data }
    if (updateData.birthDate && typeof updateData.birthDate === "string") {
      updateData.birthDate = new Date(updateData.birthDate)
    }

    // Recalcular score de crédito se renda foi alterada
    if (data.income && !data.creditScore) {
      updateData.creditScore = await this.calculateCreditScore({
        ...existingBorrower,
        ...updateData,
      } as CreateBorrowerInput)
    }

    // Atualizar borrower
    const updatedBorrower = await prisma.borrower.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return updatedBorrower
  }

  static async deleteBorrower(id: string) {
    // Verificar se o borrower existe
    const existingBorrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        loans: {
          where: {
            status: {
              in: ["PENDING", "APPROVED", "DISBURSED", "ACTIVE"],
            },
          },
        },
      },
    })

    if (!existingBorrower) {
      throw new Error("Cliente não encontrado")
    }

    // Verificar se há empréstimos ativos
    if (existingBorrower.loans.length > 0) {
      throw new Error("Não é possível excluir cliente com empréstimos ativos")
    }

    // Soft delete - desativar borrower
    await prisma.borrower.update({
      where: { id },
      data: { isActive: false },
    })

    return true
  }

  static async getBorrowerStats() {
    const [total, active, byState, avgIncome, avgCreditScore, incomeRanges] = await Promise.all([
      prisma.borrower.count(),
      prisma.borrower.count({ where: { isActive: true } }),
      prisma.borrower.groupBy({
        by: ["state"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.borrower.aggregate({
        _avg: { income: true },
        where: { isActive: true },
      }),
      prisma.borrower.aggregate({
        _avg: { creditScore: true },
        where: { isActive: true, creditScore: { not: null } },
      }),
      Promise.all([
        prisma.borrower.count({
          where: { income: { lte: 2000 }, isActive: true },
        }),
        prisma.borrower.count({
          where: { income: { gt: 2000, lte: 5000 }, isActive: true },
        }),
        prisma.borrower.count({
          where: { income: { gt: 5000, lte: 10000 }, isActive: true },
        }),
        prisma.borrower.count({
          where: { income: { gt: 10000 }, isActive: true },
        }),
      ]),
    ])

    return {
      total,
      active,
      inactive: total - active,
      byState: byState.map((item) => ({
        state: item.state,
        count: item._count.id,
      })),
      avgIncome: avgIncome._avg.income || 0,
      avgCreditScore: avgCreditScore._avg.creditScore || 0,
      incomeRanges: {
        "0-2000": incomeRanges[0],
        "2001-5000": incomeRanges[1],
        "5001-10000": incomeRanges[2],
        "10000+": incomeRanges[3],
      },
    }
  }

  private static async calculateCreditScore(data: CreateBorrowerInput): Promise<number> {
    let score = 500 // Score base

    // Fator renda (0-300 pontos)
    const income = typeof data.income === "number" ? data.income : Number.parseFloat(data.income.toString())
    if (income >= 10000) score += 300
    else if (income >= 5000) score += 200
    else if (income >= 2000) score += 100
    else if (income >= 1000) score += 50

    // Fator idade (0-100 pontos)
    const birthDate = typeof data.birthDate === "string" ? new Date(data.birthDate) : data.birthDate
    const age = new Date().getFullYear() - birthDate.getFullYear()
    if (age >= 30 && age <= 50) score += 100
    else if (age >= 25 && age <= 60) score += 50

    // Fator localização (0-100 pontos)
    const goodStates = ["SP", "RJ", "MG", "RS", "PR", "SC"]
    if (goodStates.includes(data.state)) score += 50

    // Garantir que o score esteja entre 0 e 1000
    return Math.min(1000, Math.max(0, score))
  }
}

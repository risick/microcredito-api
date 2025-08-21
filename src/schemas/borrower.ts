import { z } from "zod"
import { biSchema, phoneSchema } from "@/utils/validation"

export const createBorrowerSchema = z.object({
  userId: z.string().cuid("ID do usuário inválido").optional(),
  bi: biSchema,
  phone: phoneSchema,
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{8}$/, "CEP deve conter 8 dígitos"),
  birthDate: z.string().datetime("Data de nascimento inválida").or(z.date()),
  income: z
    .number()
    .positive("Renda deve ser positiva")
    .or(z.string().transform((val) => Number.parseFloat(val))),
  creditScore: z.number().int().min(0).max(1000).optional(),
})

export const updateBorrowerSchema = createBorrowerSchema.partial()

export const borrowerQuerySchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minIncome: z
    .string()
    .transform((val) => Number.parseFloat(val))
    .optional(),
  maxIncome: z
    .string()
    .transform((val) => Number.parseFloat(val))
    .optional(),
  minCreditScore: z
    .string()
    .transform((val) => Number.parseInt(val))
    .optional(),
  maxCreditScore: z
    .string()
    .transform((val) => Number.parseInt(val))
    .optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
})

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>
export type UpdateBorrowerInput = z.infer<typeof updateBorrowerSchema>
export type BorrowerQueryInput = z.infer<typeof borrowerQuerySchema>

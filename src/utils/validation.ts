import { z } from "zod"

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number.parseInt(val || "1", 10)),
  limit: z
    .string()
    .optional()
    .transform((val) => Number.parseInt(val || "10", 10)),
})

export const validatePagination = (query: any) => {
  const result = paginationSchema.safeParse(query)
  if (!result.success) {
    throw new Error("Invalid pagination parameters")
  }

  const { page, limit } = result.data
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  }
}

export const biSchema = z.string().regex(/^\d{11}$/, "bi deve conter 11 dígitos")
export const phoneSchema = z.string().regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 dígitos")
export const emailSchema = z.string().email("Email inválido")

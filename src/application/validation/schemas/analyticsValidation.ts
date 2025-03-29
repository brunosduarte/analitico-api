import { z } from 'zod'

// Esquema para validação de IDs de extratos
export const extratoIdsSchema = z.object({
  extratoIds: z.string().or(z.array(z.string())),
})

// Esquema para validação de parâmetros de data
export const dateParamsSchema = z.object({
  mes: z.string().optional(),
  ano: z.string().optional(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

// Esquema para validação de parâmetros dos top trabalhos
export const topJobsParamsSchema = dateParamsSchema.extend({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
})

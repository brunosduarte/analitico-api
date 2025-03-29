import { z } from 'zod'

// Esquema para cada trabalho individual
export const trabalhoSchema = z.object({
  dia: z.string(),
  folha: z.string(),
  tomador: z.string(),
  tomadorNome: z.string().optional(),
  pasta: z.string(),
  fun: z.string(),
  tur: z.string(),
  ter: z.string(),
  pagto: z.string(),
  baseDeCalculo: z.number(),
  inss: z.number(),
  impostoDeRenda: z.number(),
  descontoJudicial: z.number(),
  das: z.number(),
  mensal: z.number(),
  impostoSindical: z.number(),
  descontosEpiCracha: z.number(),
  liquido: z.number(),
  ferias: z.number(),
  decimoTerceiro: z.number(),
  encargosDecimo: z.number(),
  fgts: z.number(),
})

// Esquema para resumo de extrato
export const resumoExtratoSchema = z.object({
  baseDeCalculo: z.number(),
  inss: z.number(),
  impostoDeRenda: z.number(),
  descontoJudicial: z.number(),
  das: z.number(),
  mensal: z.number(),
  impostoSindical: z.number(),
  descontosEpiCracha: z.number(),
  liquido: z.number(),
  ferias: z.number(),
  decimoTerceiro: z.number(),
  encargosDecimo: z.number(),
  fgts: z.number(),
})

// Esquema principal para extrato
export const extratoSchema = z.object({
  matricula: z.string(),
  nome: z.string(),
  mes: z.string(),
  ano: z.string(),
  categoria: z.string(),
  trabalhos: z.array(trabalhoSchema),
  folhasComplementos: resumoExtratoSchema,
  revisadas: resumoExtratoSchema,
})

// Esquema para filtros de extrato em listagens
export const extratoFilterSchema = z.object({
  matricula: z.string().optional(),
  nome: z.string().optional(),
  mes: z.string().optional(),
  ano: z.string().optional(),
  categoria: z.string().optional(),
  tomador: z.string().optional(),
})

// Esquema para filtros por período
export const periodFilterSchema = z.object({
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  mes: z.string().optional(),
  ano: z.string().optional(),
  matricula: z.string().optional(),
  nome: z.string().optional(),
  categoria: z.string().optional(),
})

// Esquema para validação de upload de arquivos
export const fileUploadSchema = z.object({
  originalname: z.string(),
  mimetype: z.literal('application/pdf'),
  path: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10MB
})

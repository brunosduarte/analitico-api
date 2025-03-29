import { parse, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { ValidationError } from '../../../domain/errors/ValidationError'

/**
 * Função para validar e obter intervalo de datas com base nos parâmetros
 * Ordem de prioridade:
 * 1. dataInicio e dataFim (se ambos forem fornecidos)
 * 2. mes e ano (se ambos forem fornecidos)
 * 3. Mês atual por padrão
 */
export async function validateDateParams(
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<{ from: Date; to: Date }> {
  // Se dataInicio e dataFim estão presentes, usar essas datas
  if (dataInicio && dataFim) {
    try {
      const from = parseISO(dataInicio)
      const to = parseISO(dataFim)

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new ValidationError('Datas de início ou fim inválidas')
      }

      return { from, to }
    } catch (error) {
      throw new ValidationError(
        'Datas de início ou fim em formato inválido. Use YYYY-MM-DD.',
      )
    }
  }

  // Se mes e ano estão presentes, usar mês completo
  if (mes && ano) {
    const mesNumero = getMesNumero(mes)
    const anoNumero = parseInt(ano)

    if (isNaN(mesNumero) || isNaN(anoNumero)) {
      throw new ValidationError('Mês ou ano inválidos')
    }

    // Criar data com o primeiro dia do mês
    const from = new Date(anoNumero, mesNumero - 1, 1)

    // Último dia do mês
    const to = endOfMonth(from)

    return { from, to }
  }

  // Caso padrão: usar mês atual
  const now = new Date()
  return {
    from: startOfMonth(now),
    to: endOfMonth(now),
  }
}

/**
 * Função para parsear intervalo de datas de uma string (ex: "2023-01-01 - 2023-01-31")
 */
export function parseDateRange(dateRangeStr: string): { from: Date; to: Date } {
  try {
    const [fromStr, toStr] = dateRangeStr.split(' - ')

    // Tentar diferentes formatos de data
    let from: Date | null = null
    let to: Date | null = null

    // Tentar formato ISO (YYYY-MM-DD)
    try {
      from = parseISO(fromStr.trim())
      to = parseISO(toStr.trim())
    } catch (e) {
      // Ignorar erro e tentar próximo formato
    }

    // Tentar formato DD/MM/YYYY
    if (!from || isNaN(from.getTime()) || !to || isNaN(to.getTime())) {
      try {
        from = parse(fromStr.trim(), 'dd/MM/yyyy', new Date())
        to = parse(toStr.trim(), 'dd/MM/yyyy', new Date())
      } catch (e) {
        // Ignorar erro e tentar próximo formato
      }
    }

    // Tentar formato DD/MM/YY
    if (!from || isNaN(from.getTime()) || !to || isNaN(to.getTime())) {
      try {
        from = parse(fromStr.trim(), 'dd/MM/yy', new Date())
        to = parse(toStr.trim(), 'dd/MM/yy', new Date())
      } catch (e) {
        // Ignorar erro
      }
    }

    if (!from || isNaN(from.getTime()) || !to || isNaN(to.getTime())) {
      throw new ValidationError('Não foi possível parsear as datas')
    }

    return { from, to }
  } catch (error) {
    throw new ValidationError(
      'Formato de intervalo de datas inválido. Use "YYYY-MM-DD - YYYY-MM-DD" ou "DD/MM/YYYY - DD/MM/YYYY".',
    )
  }
}

/**
 * Função para converter mês abreviado para número
 */
export function getMesNumero(mes: string): number {
  const mesesMap: { [key: string]: number } = {
    JAN: 1,
    FEV: 2,
    MAR: 3,
    ABR: 4,
    MAI: 5,
    JUN: 6,
    JUL: 7,
    AGO: 8,
    SET: 9,
    OUT: 10,
    NOV: 11,
    DEZ: 12,
  }

  return mesesMap[mes.toUpperCase()] || 0
}

/**
 * Função para converter número do mês para abreviação
 */
export function getMesAbreviado(mesIndex: number): string {
  const meses = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ]
  return meses[mesIndex]
}

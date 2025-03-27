import ExtratoModel from '../models/ExtratoModel'
import mongoose from 'mongoose'
import { format, startOfWeek } from 'date-fns'

// Interface para o tomador
interface Tomador {
  tomador: string
  tomadorNome: string
  totalTrabalhos: number
  valorTotal: number
}

// Interface para dados semanais
interface WeeklyDataMonth {
  [monthKey: string]: number
}

interface WeeklyData {
  [weekKey: string]: WeeklyDataMonth
}

export class AnalyticsService {
  /**
   * Obter análise de tomadores baseada em IDs de extratos
   */
  static async getTomadoresAnalytics(extratoIds: string[]) {
    try {
      const extratos = await ExtratoModel.find({
        _id: { $in: extratoIds.map((id) => new mongoose.Types.ObjectId(id)) },
      })

      if (!extratos.length) {
        return []
      }

      // Agrupar trabalhos por tomador
      const tomadoresMap: Record<string, Tomador> = {}

      // Processar todos os trabalhos de todos os extratos
      extratos.forEach((extrato) => {
        ;(extrato.trabalhos || []).forEach((trabalho) => {
          const { tomador, baseDeCalculo } = trabalho

          if (!tomadoresMap[tomador]) {
            tomadoresMap[tomador] = {
              tomador,
              tomadorNome: trabalho.tomadorNome || tomador,
              totalTrabalhos: 0,
              valorTotal: 0,
            }
          }

          tomadoresMap[tomador].totalTrabalhos += 1
          tomadoresMap[tomador].valorTotal += baseDeCalculo
        })
      })

      // Converter mapa para array e ordenar por valor total
      return Object.values(tomadoresMap).sort(
        (a, b) => b.valorTotal - a.valorTotal,
      )
    } catch (error) {
      console.error('Erro ao analisar tomadores:', error)
      throw new Error('Erro ao analisar dados de tomadores')
    }
  }

  /**
   * Obter distribuição salarial (breakdown)
   */
  static async getSalaryBreakdown(startDate: Date, endDate: Date) {
    try {
      // Agregação para obter totais por componente salarial
      const aggregation = await ExtratoModel.aggregate([
        {
          $match: {
            $or: [
              {
                ano: {
                  $gte: startDate.getFullYear().toString(),
                  $lte: endDate.getFullYear().toString(),
                },
                mes: {
                  $in: this.getMonthsBetween(
                    startDate.getMonth() + 1,
                    startDate.getFullYear(),
                    endDate.getMonth() + 1,
                    endDate.getFullYear(),
                  ),
                },
              },
            ],
          },
        },
        { $unwind: '$trabalhos' },
        {
          $group: {
            _id: null,
            liquido: { $sum: '$trabalhos.liquido' },
            impostoDeRenda: { $sum: '$trabalhos.impostoDeRenda' },
            inss: { $sum: '$trabalhos.inss' },
            das: { $sum: '$trabalhos.das' },
            impostoSindical: { $sum: '$trabalhos.impostoSindical' },
            descontoJudicial: { $sum: '$trabalhos.descontoJudicial' },
            descontosEpiCracha: { $sum: '$trabalhos.descontosEpiCracha' },
            mensal: { $sum: '$trabalhos.mensal' },
          },
        },
      ])

      if (!aggregation.length) {
        return []
      }

      const result = aggregation[0]

      // Converter para o formato esperado pela visualização
      return [
        { name: 'Líquido', value: result.liquido || 0 },
        { name: 'IRPF', value: result.impostoDeRenda || 0 },
        { name: 'INSS', value: result.inss || 0 },
        { name: 'DAS', value: result.das || 0 },
        { name: 'Sindical', value: result.impostoSindical || 0 },
        { name: 'Judicial', value: result.descontoJudicial || 0 },
        {
          name: 'Outros',
          value: (result.descontosEpiCracha || 0) + (result.mensal || 0),
        },
      ].filter((item) => item.value > 0)
    } catch (error) {
      console.error('Erro ao obter breakdown salarial:', error)
      throw new Error('Erro ao obter breakdown salarial')
    }
  }

  /**
   * Obter distribuição de turnos trabalhados
   */
  static async getShiftDistribution(startDate: Date, endDate: Date) {
    try {
      const aggregation = await ExtratoModel.aggregate([
        {
          $match: {
            $or: [
              {
                ano: {
                  $gte: startDate.getFullYear().toString(),
                  $lte: endDate.getFullYear().toString(),
                },
                mes: {
                  $in: this.getMonthsBetween(
                    startDate.getMonth() + 1,
                    startDate.getFullYear(),
                    endDate.getMonth() + 1,
                    endDate.getFullYear(),
                  ),
                },
              },
            ],
          },
        },
        { $unwind: '$trabalhos' },
        {
          $group: {
            _id: '$trabalhos.tur',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])

      // Converter para o formato esperado pela visualização
      return aggregation.map((item) => ({
        name: `Turno ${item._id}`,
        value: item.count,
      }))
    } catch (error) {
      console.error('Erro ao obter distribuição de turnos:', error)
      throw new Error('Erro ao obter distribuição de turnos')
    }
  }

  /**
   * Obter distribuição semanal de trabalhos
   */
  static async getWeeklyWorkDistribution(startDate: Date, endDate: Date) {
    try {
      // Primeiro, obter todos os trabalhos no período
      const extratos = await ExtratoModel.find({
        $or: [
          {
            ano: {
              $gte: startDate.getFullYear().toString(),
              $lte: endDate.getFullYear().toString(),
            },
            mes: {
              $in: this.getMonthsBetween(
                startDate.getMonth() + 1,
                startDate.getFullYear(),
                endDate.getMonth() + 1,
                endDate.getFullYear(),
              ),
            },
          },
        ],
      })

      // Processar trabalhos e agrupar por semana e mês
      const weeklyData: WeeklyData = {}

      extratos.forEach((extrato) => {
        const ano = parseInt(extrato.ano)
        const mesIndex = this.getMesNumerico(extrato.mes) - 1 // 0-indexed

        ;(extrato.trabalhos || []).forEach((trabalho) => {
          const dia = parseInt(trabalho.dia)
          const date = new Date(ano, mesIndex, dia)

          // Obter o início da semana para usar como chave
          const weekStart = startOfWeek(date, { weekStartsOn: 0 })
          const weekKey = format(weekStart, 'MM/dd')
          const monthKey = format(date, 'MM/yy')

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {}
          }

          if (!weeklyData[weekKey][monthKey]) {
            weeklyData[weekKey][monthKey] = 0
          }

          weeklyData[weekKey][monthKey] += 1
        })
      })

      // Converter para o formato esperado pela visualização
      return Object.entries(weeklyData)
        .map(([week, months]) => {
          return {
            week: `Semana ${week}`,
            ...months,
          }
        })
        .sort((a, b) => {
          const weekA = a.week.split(' ')[1]
          const weekB = b.week.split(' ')[1]
          return weekA.localeCompare(weekB)
        })
    } catch (error) {
      console.error('Erro ao obter distribuição semanal de trabalhos:', error)
      throw new Error('Erro ao obter distribuição semanal de trabalhos')
    }
  }

  /**
   * Obter top trabalhos (fainas) por valor
   */
  static async getTopJobs(startDate: Date, endDate: Date, limit: number = 10) {
    try {
      // Agregação para obter trabalhos ordenados por valor
      const aggregation = await ExtratoModel.aggregate([
        {
          $match: {
            $or: [
              {
                ano: {
                  $gte: startDate.getFullYear().toString(),
                  $lte: endDate.getFullYear().toString(),
                },
                mes: {
                  $in: this.getMonthsBetween(
                    startDate.getMonth() + 1,
                    startDate.getFullYear(),
                    endDate.getMonth() + 1,
                    endDate.getFullYear(),
                  ),
                },
              },
            ],
          },
        },
        { $unwind: '$trabalhos' },
        { $sort: { 'trabalhos.baseDeCalculo': -1 } },
        { $limit: limit },
        {
          $project: {
            pasta: '$trabalhos.pasta',
            dia: '$trabalhos.dia',
            pagto: '$trabalhos.pagto',
            tur: '$trabalhos.tur',
            valor: '$trabalhos.baseDeCalculo',
          },
        },
      ])

      // Converter para o formato esperado pela visualização
      return aggregation.map((trabalho) => ({
        name: `${trabalho.pasta} ${trabalho.dia}/${trabalho.pagto.split('/')[0]}-${trabalho.tur}`,
        value: trabalho.valor,
      }))
    } catch (error) {
      console.error('Erro ao obter top trabalhos:', error)
      throw new Error('Erro ao obter top trabalhos')
    }
  }

  /**
   * Obter dados de retornos (férias, 13º, FGTS)
   */
  static async getReturnsData(startDate: Date, endDate: Date) {
    try {
      const aggregation = await ExtratoModel.aggregate([
        {
          $match: {
            $or: [
              {
                ano: {
                  $gte: startDate.getFullYear().toString(),
                  $lte: endDate.getFullYear().toString(),
                },
                mes: {
                  $in: this.getMonthsBetween(
                    startDate.getMonth() + 1,
                    startDate.getFullYear(),
                    endDate.getMonth() + 1,
                    endDate.getFullYear(),
                  ),
                },
              },
            ],
          },
        },
        { $unwind: '$trabalhos' },
        {
          $group: {
            _id: null,
            ferias: { $sum: '$trabalhos.ferias' },
            decimoTerceiro: { $sum: '$trabalhos.decimoTerceiro' },
            fgts: { $sum: '$trabalhos.fgts' },
          },
        },
      ])

      if (!aggregation.length) {
        return [
          { name: 'Férias', value: 0 },
          { name: '13º', value: 0 },
          { name: 'FGTS', value: 0 },
        ]
      }

      const result = aggregation[0]

      // Converter para o formato esperado pela visualização
      return [
        { name: 'Férias', value: result.ferias || 0 },
        { name: '13º', value: result.decimoTerceiro || 0 },
        { name: 'FGTS', value: result.fgts || 0 },
      ]
    } catch (error) {
      console.error('Erro ao obter dados de retornos:', error)
      throw new Error('Erro ao obter dados de retornos')
    }
  }

  /**
   * Obter resumo do dashboard
   */
  static async getDashboardSummary(startDate: Date, endDate: Date) {
    try {
      // Calcular o número de semanas no período
      const totalDays =
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      const totalWeeks = Math.ceil(totalDays / 7)

      // Obter todos os trabalhos no período
      const extratos = await ExtratoModel.find({
        $or: [
          {
            ano: {
              $gte: startDate.getFullYear().toString(),
              $lte: endDate.getFullYear().toString(),
            },
            mes: {
              $in: this.getMonthsBetween(
                startDate.getMonth() + 1,
                startDate.getFullYear(),
                endDate.getMonth() + 1,
                endDate.getFullYear(),
              ),
            },
          },
        ],
      })

      let totalTrabalhos = 0
      let totalBruto = 0
      let totalLiquido = 0
      const diasTrabalhados = new Set()

      // Processar todos os trabalhos
      extratos.forEach((extrato) => {
        const ano = parseInt(extrato.ano)
        const mesIndex = this.getMesNumerico(extrato.mes) - 1

        ;(extrato.trabalhos || []).forEach((trabalho) => {
          const dia = parseInt(trabalho.dia)
          const dataTrabalho = `${dia}/${mesIndex + 1}/${ano}`

          totalTrabalhos += 1
          totalBruto += trabalho.baseDeCalculo || 0
          totalLiquido += trabalho.liquido || 0
          diasTrabalhados.add(dataTrabalho)
        })
      })

      // Calcular médias
      const mediaBrutoFaina =
        totalTrabalhos > 0 ? totalBruto / totalTrabalhos : 0
      const mediaLiquidoFaina =
        totalTrabalhos > 0 ? totalLiquido / totalTrabalhos : 0
      const mediaFainasSemana = totalWeeks > 0 ? totalTrabalhos / totalWeeks : 0

      return {
        totalFainas: totalTrabalhos,
        mediaFainasSemana,
        diasTrabalhados: diasTrabalhados.size,
        mediaBrutoFaina,
        mediaLiquidoFaina,
      }
    } catch (error) {
      console.error('Erro ao obter resumo do dashboard:', error)
      throw new Error('Erro ao obter resumo do dashboard')
    }
  }

  /**
   * Método auxiliar para obter todos os meses entre duas datas
   */
  private static getMonthsBetween(
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ): string[] {
    const months = [
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
    const result = []

    if (startYear === endYear) {
      // Mesmo ano, apenas filtrar os meses entre startMonth e endMonth
      for (let m = startMonth - 1; m < endMonth; m++) {
        result.push(months[m])
      }
    } else {
      // Anos diferentes
      // Adicionar meses do primeiro ano
      for (let m = startMonth - 1; m < 12; m++) {
        result.push(months[m])
      }

      // Adicionar anos intermediários (todos os meses)
      for (let y = startYear + 1; y < endYear; y++) {
        result.push(...months)
      }

      // Adicionar meses do último ano
      for (let m = 0; m < endMonth; m++) {
        result.push(months[m])
      }
    }

    return result
  }

  /**
   * Método auxiliar para converter mês abreviado para número
   */
  private static getMesNumerico(mesAbreviado: string): number {
    const mesesMap: Record<string, number> = {
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

    return mesesMap[mesAbreviado] || 1
  }
}

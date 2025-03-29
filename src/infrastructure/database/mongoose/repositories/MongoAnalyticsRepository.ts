import {
  IAnalyticsRepository,
  TomadorAnalytics,
  SalaryBreakdownItem,
  ShiftDistributionItem,
  WeeklyWorkItem,
  TopJobItem,
  ReturnsDataItem,
  DashboardSummary,
} from '../../../../domain/repositories/interfaces/IAnalyticsRepository'
import mongoose from 'mongoose'
import ExtratoModel from '../models/ExtratoModel'
import { DatabaseError } from '../../../../domain/errors/DatabaseError'
import { format, startOfWeek } from 'date-fns'
import { getMesAbreviado, getMesNumero } from '../../../utils/date/DateUtils'

export class MongoAnalyticsRepository implements IAnalyticsRepository {
  async getTomadoresAnalytics(
    extratoIds: string[],
  ): Promise<TomadorAnalytics[]> {
    try {
      const extratos = await ExtratoModel.find({
        _id: { $in: extratoIds.map((id) => new mongoose.Types.ObjectId(id)) },
      })

      if (!extratos.length) {
        return []
      }

      // Agrupar trabalhos por tomador
      const tomadoresMap: Record<string, TomadorAnalytics> = {}

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
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Erro ao analisar tomadores',
      )
    }
  }

  async getSalaryBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<SalaryBreakdownItem[]> {
    try {
      // Criar filtro por período
      const dateFilter = this.createDateFilter(startDate, endDate)

      // Agregação para obter totais por componente salarial
      const aggregation = await ExtratoModel.aggregate([
        { $match: dateFilter },
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

      // Converter para o formato esperado pelo frontend
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
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao obter breakdown salarial',
      )
    }
  }

  async getShiftDistribution(
    startDate: Date,
    endDate: Date,
  ): Promise<ShiftDistributionItem[]> {
    try {
      // Criar filtro por período
      const dateFilter = this.createDateFilter(startDate, endDate)

      const aggregation = await ExtratoModel.aggregate([
        { $match: dateFilter },
        { $unwind: '$trabalhos' },
        {
          $group: {
            _id: '$trabalhos.tur',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])

      // Converter para o formato esperado pelo frontend
      return aggregation.map((item) => ({
        name: `Turno ${item._id}`,
        value: item.count,
      }))
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao obter distribuição de turnos',
      )
    }
  }

  async getWeeklyWorkDistribution(
    startDate: Date,
    endDate: Date,
  ): Promise<WeeklyWorkItem[]> {
    try {
      // Criar filtro por período
      const dateFilter = this.createDateFilter(startDate, endDate)

      // Primeiro, obter todos os trabalhos no período
      const extratos = await ExtratoModel.find(dateFilter)

      // Processar trabalhos e agrupar por semana e mês
      interface WeeklyDataMonth {
        [monthKey: string]: number
      }

      interface WeeklyData {
        [weekKey: string]: WeeklyDataMonth
      }

      const weeklyData: WeeklyData = {}

      extratos.forEach((extrato) => {
        const ano = parseInt(extrato.ano)
        const mesIndex = getMesNumero(extrato.mes) - 1 // 0-indexed

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

      // Converter para o formato esperado pelo frontend
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
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao obter distribuição semanal de trabalhos',
      )
    }
  }

  async getTopJobs(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<TopJobItem[]> {
    try {
      // Criar filtro por período
      const dateFilter = this.createDateFilter(startDate, endDate)

      // Agregação para obter trabalhos ordenados por valor
      const aggregation = await ExtratoModel.aggregate([
        { $match: dateFilter },
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

      // Converter para o formato esperado pelo frontend
      return aggregation.map((trabalho) => ({
        name: `${trabalho.pasta} ${trabalho.dia}/${trabalho.pagto.split('/')[0]}-${trabalho.tur}`,
        value: trabalho.valor,
      }))
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Erro ao obter top trabalhos',
      )
    }
  }

  async getReturnsData(
    startDate: Date,
    endDate: Date,
  ): Promise<ReturnsDataItem[]> {
    try {
      // Criar filtro por período
      const dateFilter = this.createDateFilter(startDate, endDate)

      const aggregation = await ExtratoModel.aggregate([
        { $match: dateFilter },
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

      // Converter para o formato esperado pelo frontend
      return [
        { name: 'Férias', value: result.ferias || 0 },
        { name: '13º', value: result.decimoTerceiro || 0 },
        { name: 'FGTS', value: result.fgts || 0 },
      ]
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao obter dados de retornos',
      )
    }
  }

  async getDashboardSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardSummary> {
    try {
      // Criar filtro por período
      const dateFilter = this.createDateFilter(startDate, endDate)

      // Calcular o número de semanas no período
      const totalDays =
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      const totalWeeks = Math.ceil(totalDays / 7)

      // Obter todos os trabalhos no período
      const extratos = await ExtratoModel.find(dateFilter)

      let totalTrabalhos = 0
      let totalBruto = 0
      let totalLiquido = 0
      const diasTrabalhados = new Set()

      // Processar todos os trabalhos
      extratos.forEach((extrato) => {
        const ano = parseInt(extrato.ano)
        const mesIndex = getMesNumero(extrato.mes) - 1

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
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao obter resumo do dashboard',
      )
    }
  }

  /**
   * Cria um filtro de data baseado no intervalo fornecido
   */
  private createDateFilter(startDate: Date, endDate: Date): any {
    const startYear = startDate.getFullYear().toString()
    const endYear = endDate.getFullYear().toString()

    // Se mesmo ano
    if (startYear === endYear) {
      const startMonth = startDate.getMonth()
      const endMonth = endDate.getMonth()
      const mesesPeriodo = []

      for (let i = startMonth; i <= endMonth; i++) {
        mesesPeriodo.push(getMesAbreviado(i))
      }

      return {
        ano: startYear,
        mes: { $in: mesesPeriodo },
      }
    } else {
      // Anos diferentes - usar condições OR
      const orConditions = []

      // Meses do primeiro ano
      const mesesPrimeiroAno = []
      for (let i = startDate.getMonth(); i < 12; i++) {
        mesesPrimeiroAno.push(getMesAbreviado(i))
      }

      if (mesesPrimeiroAno.length > 0) {
        orConditions.push({
          ano: startYear,
          mes: { $in: mesesPrimeiroAno },
        })
      }

      // Anos intermediários (todos os meses)
      for (let ano = parseInt(startYear) + 1; ano < parseInt(endYear); ano++) {
        orConditions.push({
          ano: ano.toString(),
          mes: {
            $in: [
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
            ],
          },
        })
      }

      // Meses do último ano
      const mesesUltimoAno = []
      for (let i = 0; i <= endDate.getMonth(); i++) {
        mesesUltimoAno.push(getMesAbreviado(i))
      }

      if (mesesUltimoAno.length > 0) {
        orConditions.push({
          ano: endYear,
          mes: { $in: mesesUltimoAno },
        })
      }

      // Retorna condição OR se houver condições
      return orConditions.length > 0 ? { $or: orConditions } : {}
    }
  }
}

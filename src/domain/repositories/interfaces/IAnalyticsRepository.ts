import { Extrato } from '../../entities/Extrato'

export interface TomadorAnalytics {
  tomador: string
  tomadorNome: string
  totalTrabalhos: number
  valorTotal: number
}

export interface SalaryBreakdownItem {
  name: string
  value: number
}

export interface ShiftDistributionItem {
  name: string
  value: number
}

export interface WeeklyWorkItem {
  week: string
  [monthKey: string]: string | number
}

export interface TopJobItem {
  name: string
  value: number
}

export interface ReturnsDataItem {
  name: string
  value: number
}

export interface DashboardSummary {
  totalFainas: number
  mediaFainasSemana: number
  diasTrabalhados: number
  mediaBrutoFaina: number
  mediaLiquidoFaina: number
}

export interface IAnalyticsRepository {
  getTomadoresAnalytics(extratoIds: string[]): Promise<TomadorAnalytics[]>
  getSalaryBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<SalaryBreakdownItem[]>
  getShiftDistribution(
    startDate: Date,
    endDate: Date,
  ): Promise<ShiftDistributionItem[]>
  getWeeklyWorkDistribution(
    startDate: Date,
    endDate: Date,
  ): Promise<WeeklyWorkItem[]>
  getTopJobs(
    startDate: Date,
    endDate: Date,
    limit?: number,
  ): Promise<TopJobItem[]>
  getReturnsData(startDate: Date, endDate: Date): Promise<ReturnsDataItem[]>
  getDashboardSummary(startDate: Date, endDate: Date): Promise<DashboardSummary>
}

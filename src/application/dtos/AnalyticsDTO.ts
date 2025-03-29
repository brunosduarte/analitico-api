export interface TomadorAnalyticsDTO {
  tomador: string
  tomadorNome: string
  totalTrabalhos: number
  valorTotal: number
}

export interface ChartDataItemDTO {
  name: string
  value: number
}

export interface WeeklyWorkItemDTO {
  week: string
  [monthKey: string]: string | number
}

export interface DashboardSummaryDTO {
  totalFainas: number
  mediaFainasSemana: number
  diasTrabalhados: number
  mediaBrutoFaina: number
  mediaLiquidoFaina: number
}

export interface DateRangeDTO {
  from: Date
  to: Date
}

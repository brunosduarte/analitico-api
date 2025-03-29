import { Request, Response, NextFunction } from 'express'
import { GetTomadoresAnalyticsUseCase } from '../../application/usecases/analytics/GetTomadoresAnalyticsUseCase'
import { GetSalaryBreakdownUseCase } from '../../application/usecases/analytics/GetSalaryBreakdownUseCase'
import { GetShiftDistributionUseCase } from '../../application/usecases/analytics/GetShiftDistributionUseCase'
import { GetWeeklyWorkDistributionUseCase } from '../../application/usecases/analytics/GetWeeklyWorkDistributionUseCase'
import { GetTopJobsUseCase } from '../../application/usecases/analytics/GetTopJobsUseCase'
import { GetReturnsDataUseCase } from '../../application/usecases/analytics/GetReturnsDataUseCase'
import { GetDashboardSummaryUseCase } from '../../application/usecases/analytics/GetDashboardSummaryUseCase'
import { GetFunctionDistributionUseCase } from '../../application/usecases/analytics/GetFunctionDistributionUseCase'
import {
  extratoIdsSchema,
  dateParamsSchema,
  topJobsParamsSchema,
} from '../../application/validation/schemas/analyticsValidation'
import { validateDateParams } from '../../infrastructure/utils/date/DateUtils'

export class AnalyticsController {
  // Declaração de dependências como propriedades privadas
  private readonly getTomadoresAnalyticsUseCase: GetTomadoresAnalyticsUseCase
  private readonly getSalaryBreakdownUseCase: GetSalaryBreakdownUseCase
  private readonly getShiftDistributionUseCase: GetShiftDistributionUseCase
  private readonly getWeeklyWorkDistributionUseCase: GetWeeklyWorkDistributionUseCase
  private readonly getTopJobsUseCase: GetTopJobsUseCase
  private readonly getReturnsDataUseCase: GetReturnsDataUseCase
  private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase
  private readonly getFunctionDistributionUseCase: GetFunctionDistributionUseCase

  // Inicialização das dependências no construtor
  constructor(
    getTomadoresAnalyticsUseCase: GetTomadoresAnalyticsUseCase,
    getSalaryBreakdownUseCase: GetSalaryBreakdownUseCase,
    getShiftDistributionUseCase: GetShiftDistributionUseCase,
    getWeeklyWorkDistributionUseCase: GetWeeklyWorkDistributionUseCase,
    getTopJobsUseCase: GetTopJobsUseCase,
    getReturnsDataUseCase: GetReturnsDataUseCase,
    getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    getFunctionDistributionUseCase: GetFunctionDistributionUseCase,
  ) {
    this.getTomadoresAnalyticsUseCase = getTomadoresAnalyticsUseCase
    this.getSalaryBreakdownUseCase = getSalaryBreakdownUseCase
    this.getShiftDistributionUseCase = getShiftDistributionUseCase
    this.getWeeklyWorkDistributionUseCase = getWeeklyWorkDistributionUseCase
    this.getTopJobsUseCase = getTopJobsUseCase
    this.getReturnsDataUseCase = getReturnsDataUseCase
    this.getDashboardSummaryUseCase = getDashboardSummaryUseCase
    this.getFunctionDistributionUseCase = getFunctionDistributionUseCase
  }

  async getTomadoresAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar parâmetros
      const validQuery = extratoIdsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      const { extratoIds } = validQuery.data

      // Converter string de IDs para array
      const ids: string[] = Array.isArray(extratoIds)
        ? (extratoIds as string[])
        : (extratoIds as string).split(',')

      const tomadoresData = await this.getTomadoresAnalyticsUseCase.execute(ids)

      return res.status(200).json({
        success: true,
        data: tomadoresData,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSalaryBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar parâmetros
      const validQuery = dateParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      const salaryData = await this.getSalaryBreakdownUseCase.execute(dateRange)

      return res.status(200).json({
        success: true,
        data: salaryData,
      })
    } catch (error) {
      next(error)
    }
  }

  async getShiftDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar parâmetros
      const validQuery = dateParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      const shiftsData =
        await this.getShiftDistributionUseCase.execute(dateRange)

      return res.status(200).json({
        success: true,
        data: shiftsData,
      })
    } catch (error) {
      next(error)
    }
  }

  async getWeeklyWorkDistribution(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Validar parâmetros
      const validQuery = dateParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      const weeklyData =
        await this.getWeeklyWorkDistributionUseCase.execute(dateRange)

      return res.status(200).json({
        success: true,
        data: weeklyData,
      })
    } catch (error) {
      next(error)
    }
  }

  async getTopJobs(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar parâmetros
      const validQuery = topJobsParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim, limit } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      // Converter limit para número
      const limitNum = limit || 10

      const topJobs = await this.getTopJobsUseCase.execute(dateRange, limitNum)

      return res.status(200).json({
        success: true,
        data: topJobs,
      })
    } catch (error) {
      next(error)
    }
  }

  async getReturnsData(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar parâmetros
      const validQuery = dateParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      const returnsData = await this.getReturnsDataUseCase.execute(dateRange)

      return res.status(200).json({
        success: true,
        data: returnsData,
      })
    } catch (error) {
      next(error)
    }
  }

  // Novo método para obter distribuição por função
  async getFunctionDistribution(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Validar parâmetros
      const validQuery = dateParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      const functionData =
        await this.getFunctionDistributionUseCase.execute(dateRange)

      return res.status(200).json({
        success: true,
        data: functionData,
      })
    } catch (error) {
      next(error)
    }
  }

  async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar parâmetros
      const validQuery = dateParamsSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      const summaryData =
        await this.getDashboardSummaryUseCase.execute(dateRange)

      return res.status(200).json({
        success: true,
        data: summaryData,
      })
    } catch (error) {
      next(error)
    }
  }
}

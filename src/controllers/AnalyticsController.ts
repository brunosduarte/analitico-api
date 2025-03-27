import { Request, Response } from 'express'
import { AnalyticsService } from '@/services/AnalyticsService'
import { validateDateParams } from '@/utils/dateUtils'

export class AnalyticsController {
  /**
   * Obter análise de tomadores
   */
  static async getTomadoresAnalytics(req: Request, res: Response) {
    try {
      const { extratoIds } = req.query

      if (!extratoIds) {
        return res.status(400).json({
          success: false,
          message: 'É necessário informar pelo menos um ID de extrato',
        })
      }

      // Converter string de IDs para array
      const ids: string[] = Array.isArray(extratoIds)
        ? (extratoIds as string[])
        : (extratoIds as string).split(',')

      const tomadoresData = await AnalyticsService.getTomadoresAnalytics(ids)

      return res.status(200).json({
        success: true,
        data: tomadoresData,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter análise de tomadores',
      })
    }
  }

  /**
   * Obter análise de distribuição salarial
   */
  static async getSalaryBreakdown(req: Request, res: Response) {
    try {
      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = req.query
      const dateRange = await validateDateParams(
        mes as string | undefined,
        ano as string | undefined,
        dataInicio as string | undefined,
        dataFim as string | undefined,
      )

      const salaryData = await AnalyticsService.getSalaryBreakdown(
        dateRange.from,
        dateRange.to,
      )

      return res.status(200).json({
        success: true,
        data: salaryData,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter distribuição salarial',
      })
    }
  }

  /**
   * Obter distribuição de turnos
   */
  static async getShiftDistribution(req: Request, res: Response) {
    try {
      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = req.query
      const dateRange = await validateDateParams(
        mes as string | undefined,
        ano as string | undefined,
        dataInicio as string | undefined,
        dataFim as string | undefined,
      )

      const shiftsData = await AnalyticsService.getShiftDistribution(
        dateRange.from,
        dateRange.to,
      )

      return res.status(200).json({
        success: true,
        data: shiftsData,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter distribuição de turnos',
      })
    }
  }

  /**
   * Obter distribuição semanal de trabalhos
   */
  static async getWeeklyWorkDistribution(req: Request, res: Response) {
    try {
      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = req.query
      const dateRange = await validateDateParams(
        mes as string | undefined,
        ano as string | undefined,
        dataInicio as string | undefined,
        dataFim as string | undefined,
      )

      const weeklyData = await AnalyticsService.getWeeklyWorkDistribution(
        dateRange.from,
        dateRange.to,
      )

      return res.status(200).json({
        success: true,
        data: weeklyData,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter distribuição semanal',
      })
    }
  }

  /**
   * Obter top trabalhos (fainas)
   */
  static async getTopJobs(req: Request, res: Response) {
    try {
      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim, limit } = req.query
      const dateRange = await validateDateParams(
        mes as string | undefined,
        ano as string | undefined,
        dataInicio as string | undefined,
        dataFim as string | undefined,
      )

      // Converter limit para número
      const limitNum = limit ? parseInt(limit as string, 10) : 10

      const topJobs = await AnalyticsService.getTopJobs(
        dateRange.from,
        dateRange.to,
        limitNum,
      )

      return res.status(200).json({
        success: true,
        data: topJobs,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter top trabalhos',
      })
    }
  }

  /**
   * Obter dados de retornos (férias, 13º, FGTS)
   */
  static async getReturnsData(req: Request, res: Response) {
    try {
      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = req.query
      const dateRange = await validateDateParams(
        mes as string | undefined,
        ano as string | undefined,
        dataInicio as string | undefined,
        dataFim as string | undefined,
      )

      const returnsData = await AnalyticsService.getReturnsData(
        dateRange.from,
        dateRange.to,
      )

      return res.status(200).json({
        success: true,
        data: returnsData,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter dados de retornos',
      })
    }
  }

  /**
   * Obter resumo do dashboard
   */
  static async getDashboardSummary(req: Request, res: Response) {
    try {
      // Validar parâmetros de data
      const { mes, ano, dataInicio, dataFim } = req.query
      const dateRange = await validateDateParams(
        mes as string | undefined,
        ano as string | undefined,
        dataInicio as string | undefined,
        dataFim as string | undefined,
      )

      const summaryData = await AnalyticsService.getDashboardSummary(
        dateRange.from,
        dateRange.to,
      )

      return res.status(200).json({
        success: true,
        data: summaryData,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter resumo do dashboard',
      })
    }
  }
}

import { Request, Response, NextFunction } from 'express'
import { CreateExtratoUseCase } from '../../application/usecases/extrato/CreateExtratoUseCase'
import { FindExtratoByIdUseCase } from '../../application/usecases/extrato/FindExtratoByIdUseCase'
import { ListExtratosUseCase } from '../../application/usecases/extrato/ListExtratosUseCase'
import { ListExtratosByPeriodUseCase } from '../../application/usecases/extrato/ListExtratosByPeriodUseCase'
import { GetResumoMensalUseCase } from '../../application/usecases/extrato/GetResumoMensalUseCase'
import { GetTrabalhosByTomadorUseCase } from '../../application/usecases/extrato/GetTrabalhosByTomadorUseCase'
import {
  extratoFilterSchema,
  periodFilterSchema,
} from '../../application/validation/schemas/extratoValidation'
import { validateDateParams } from '../../infrastructure/utils/date/DateUtils'

export class ExtratoController {
  // Declaração de dependências como propriedades privadas
  private readonly createExtratoUseCase: CreateExtratoUseCase
  private readonly findExtratoByIdUseCase: FindExtratoByIdUseCase
  private readonly listExtratosUseCase: ListExtratosUseCase
  private readonly listExtratosByPeriodUseCase: ListExtratosByPeriodUseCase
  private readonly getResumoMensalUseCase: GetResumoMensalUseCase
  private readonly getTrabalhosByTomadorUseCase: GetTrabalhosByTomadorUseCase

  // Inicialização das dependências no construtor
  constructor(
    createExtratoUseCase: CreateExtratoUseCase,
    findExtratoByIdUseCase: FindExtratoByIdUseCase,
    listExtratosUseCase: ListExtratosUseCase,
    listExtratosByPeriodUseCase: ListExtratosByPeriodUseCase,
    getResumoMensalUseCase: GetResumoMensalUseCase,
    getTrabalhosByTomadorUseCase: GetTrabalhosByTomadorUseCase,
  ) {
    this.createExtratoUseCase = createExtratoUseCase
    this.findExtratoByIdUseCase = findExtratoByIdUseCase
    this.listExtratosUseCase = listExtratosUseCase
    this.listExtratosByPeriodUseCase = listExtratosByPeriodUseCase
    this.getResumoMensalUseCase = getResumoMensalUseCase
    this.getTrabalhosByTomadorUseCase = getTrabalhosByTomadorUseCase
  }

  async uploadExtratoAnalitico(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // O arquivo já foi validado pelo middleware
      const filePath = req.file!.path

      // Processar o arquivo PDF
      const dadosExtrato = await this.createExtratoUseCase.execute(filePath)

      return res.status(200).json({
        success: true,
        message: 'Extrato analítico processado com sucesso',
        data: {
          matricula: dadosExtrato.matricula,
          nome: dadosExtrato.nome,
          mes: dadosExtrato.mes,
          ano: dadosExtrato.ano,
          categoria: dadosExtrato.categoria,
          totalTrabalhos: dadosExtrato.trabalhos.length,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async listarExtratos(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar os parâmetros de consulta
      const validQuery = extratoFilterSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Aplicar filtros
      const extratos = await this.listExtratosUseCase.execute(validQuery.data)

      return res.status(200).json({
        success: true,
        data: extratos,
      })
    } catch (error) {
      next(error)
    }
  }

  async listarExtratosPorPeriodo(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Validar os parâmetros de consulta
      const validQuery = periodFilterSchema.safeParse(req.query)

      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Validar e obter datas
      const { dataInicio, dataFim, mes, ano, matricula, nome, categoria } =
        validQuery.data
      const dateRange = await validateDateParams(mes, ano, dataInicio, dataFim)

      // Montar filtros com o intervalo de datas
      const filters = {
        dataInicio: dateRange.from,
        dataFim: dateRange.to,
        matricula,
        nome,
        categoria,
      }

      // Buscar extratos
      const extratos = await this.listExtratosByPeriodUseCase.execute(filters)

      return res.status(200).json({
        success: true,
        data: extratos,
      })
    } catch (error) {
      next(error)
    }
  }

  async obterExtratoPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      const extrato = await this.findExtratoByIdUseCase.execute(id)

      return res.status(200).json({
        success: true,
        data: extrato,
      })
    } catch (error) {
      next(error)
    }
  }

  async obterTrabalhosPorTomador(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const tomador = req.params.tomador
      const trabalhos = await this.getTrabalhosByTomadorUseCase.execute(tomador)

      return res.status(200).json({
        success: true,
        data: trabalhos,
      })
    } catch (error) {
      next(error)
    }
  }

  async obterResumoMensal(req: Request, res: Response, next: NextFunction) {
    try {
      const { mes, ano } = req.params
      const resumo = await this.getResumoMensalUseCase.execute(mes, ano)

      return res.status(200).json({
        success: true,
        data: resumo,
      })
    } catch (error) {
      next(error)
    }
  }
}

import { Request, Response } from 'express'
import { PDFService } from '@/services/PDFService'
import { z } from 'zod'
import ExtratoModel from '@/models/ExtratoModel'
import { validateDateParams } from '@/utils/dateUtils'

export class ExtratoController {
  static async uploadExtratoAnalitico(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'Nenhum arquivo enviado' })
      }

      const filePath = req.file.path

      // Processa o arquivo PDF
      const dadosExtrato = await PDFService.processarExtratoPDF(filePath)

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
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao processar o arquivo',
      })
    }
  }

  static async listarExtratos(req: Request, res: Response) {
    try {
      // Esquema de validação para os parâmetros de consulta
      const querySchema = z.object({
        matricula: z.string().optional(),
        nome: z.string().optional(),
        mes: z.string().optional(),
        ano: z.string().optional(),
        categoria: z.string().optional(),
        tomador: z.string().optional(),
      })

      // Validar parâmetros de consulta
      const validQuery = querySchema.safeParse(req.query)
      if (!validQuery.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: validQuery.error,
        })
      }

      // Aplicar filtros
      const filtros: any = {}
      const { matricula, nome, mes, ano, categoria, tomador } = validQuery.data

      if (matricula) filtros.matricula = matricula
      if (nome) filtros.nome = { $regex: nome, $options: 'i' }
      if (mes) filtros.mes = mes
      if (ano) filtros.ano = ano
      if (categoria) filtros.categoria = categoria

      // Se há filtro por tomador, precisamos ajustar a consulta
      let extratos
      if (tomador) {
        extratos = await ExtratoModel.find({
          'trabalhos.tomador': tomador,
          ...filtros,
        })
      } else {
        extratos = await PDFService.obterExtratos(filtros)
      }

      return res.status(200).json({
        success: true,
        data: extratos.map((extrato) => ({
          id: (extrato as any)._id,
          matricula: extrato.matricula,
          nome: extrato.nome,
          mes: extrato.mes,
          ano: extrato.ano,
          categoria: extrato.categoria,
          totalTrabalhos: extrato.trabalhos?.length || 0,
          valorTotal: extrato.folhasComplementos?.liquido || 0,
        })),
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao listar extratos',
      })
    }
  }

  // Nova função para listar extratos por período com data de início e fim
  static async listarExtratosPorPeriodo(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim, matricula, nome, categoria } = req.query

      // Validar e obter datas
      const dateRange = await validateDateParams(
        undefined,
        undefined,
        dataInicio as string,
        dataFim as string,
      )

      // Montar filtros
      const filtros: any = {}

      // Filtros de texto
      if (matricula) filtros.matricula = matricula
      if (nome) filtros.nome = { $regex: nome, $options: 'i' }
      if (categoria) filtros.categoria = categoria

      // Adicionar filtro de data baseado no range
      const startYear = dateRange.from.getFullYear().toString()
      const endYear = dateRange.to.getFullYear().toString()

      // Criar array com todos os meses no intervalo
      const mesesPeriodo = []

      // Se mesmo ano, filtra meses entre início e fim
      if (startYear === endYear) {
        const startMonth = dateRange.from.getMonth()
        const endMonth = dateRange.to.getMonth()

        for (let i = startMonth; i <= endMonth; i++) {
          mesesPeriodo.push(getMesAbreviado(i))
        }

        filtros.ano = startYear
        filtros.mes = { $in: mesesPeriodo }
      } else {
        // Anos diferentes - mais complexo
        // Será tratado como uma OR condition para cada faixa de ano/mês
        const orConditions = []

        // Meses do primeiro ano
        const mesesPrimeiroAno = []
        for (let i = dateRange.from.getMonth(); i < 12; i++) {
          mesesPrimeiroAno.push(getMesAbreviado(i))
        }

        if (mesesPrimeiroAno.length > 0) {
          orConditions.push({
            ano: startYear,
            mes: { $in: mesesPrimeiroAno },
          })
        }

        // Anos intermediários (todos os meses)
        for (
          let ano = parseInt(startYear) + 1;
          ano < parseInt(endYear);
          ano++
        ) {
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
        for (let i = 0; i <= dateRange.to.getMonth(); i++) {
          mesesUltimoAno.push(getMesAbreviado(i))
        }

        if (mesesUltimoAno.length > 0) {
          orConditions.push({
            ano: endYear,
            mes: { $in: mesesUltimoAno },
          })
        }

        // Se tivermos condições OR, usamos $or
        if (orConditions.length > 0) {
          filtros.$or = orConditions
        }
      }

      // Buscar extratos com filtros
      const extratos = await PDFService.obterExtratos(filtros)

      return res.status(200).json({
        success: true,
        data: extratos.map((extrato) => ({
          id: (extrato as any)._id,
          matricula: extrato.matricula,
          nome: extrato.nome,
          mes: extrato.mes,
          ano: extrato.ano,
          categoria: extrato.categoria,
          totalTrabalhos: extrato.trabalhos?.length || 0,
          valorTotal: extrato.folhasComplementos?.liquido || 0,
        })),
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao listar extratos por período',
      })
    }
  }

  static async obterExtratoPorId(req: Request, res: Response) {
    try {
      const id = req.params.id

      const extrato = await PDFService.obterExtratoPorId(id)

      if (!extrato) {
        return res
          .status(404)
          .json({ success: false, message: 'Extrato não encontrado' })
      }

      return res.status(200).json({
        success: true,
        data: extrato,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res
        .status(500)
        .json({ success: false, message: 'Erro desconhecido ao obter extrato' })
    }
  }

  static async obterTrabalhosPorTomador(req: Request, res: Response) {
    try {
      const tomador = req.params.tomador

      if (!tomador) {
        return res
          .status(400)
          .json({ success: false, message: 'Código do tomador é obrigatório' })
      }

      const trabalhos = await PDFService.obterTrabalhosPorTomador(tomador)

      return res.status(200).json({
        success: true,
        data: trabalhos,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter trabalhos por tomador',
      })
    }
  }

  static async obterResumoMensal(req: Request, res: Response) {
    try {
      const { mes, ano } = req.params

      if (!mes || !ano) {
        return res
          .status(400)
          .json({ success: false, message: 'Mês e ano são obrigatórios' })
      }

      const resumo = await PDFService.obterResumoMensal(mes, ano)

      if (!resumo) {
        return res.status(404).json({
          success: false,
          message: 'Não foram encontrados dados para o período informado',
        })
      }

      return res.status(200).json({
        success: true,
        data: resumo,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ success: false, message: error.message })
      }
      return res.status(500).json({
        success: false,
        message: 'Erro desconhecido ao obter resumo mensal',
      })
    }
  }
}

// Função auxiliar para converter número do mês para abreviação
function getMesAbreviado(mesIndex: number): string {
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

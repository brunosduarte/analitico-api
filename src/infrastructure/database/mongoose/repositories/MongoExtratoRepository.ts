import {
  IExtratoRepository,
  ExtratoFilters,
} from '../../../../domain/repositories/interfaces/IExtratoRepository'
import { Extrato } from '../../../../domain/entities/Extrato'
import ExtratoModel from '../models/ExtratoModel'
import { DatabaseError } from '../../../../domain/errors/DatabaseError'
import {
  // getMesNumero,
  getMesAbreviado,
} from '../../../utils/date/DateUtils'

export class MongoExtratoRepository implements IExtratoRepository {
  async create(extrato: Extrato): Promise<Extrato> {
    try {
      const newExtrato = new ExtratoModel(extrato)
      const savedExtrato = await newExtrato.save()
      return this.mapToEntity(savedExtrato)
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Erro ao criar extrato',
      )
    }
  }

  async findById(id: string): Promise<Extrato | null> {
    try {
      const extrato = await ExtratoModel.findById(id)
      return extrato ? this.mapToEntity(extrato) : null
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao buscar extrato por ID',
      )
    }
  }

  async findByMatriculaMesAno(
    matricula: string,
    mes: string,
    ano: string,
  ): Promise<Extrato | null> {
    try {
      const extrato = await ExtratoModel.findOne({ matricula, mes, ano })
      return extrato ? this.mapToEntity(extrato) : null
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao buscar extrato por matrícula, mês e ano',
      )
    }
  }

  async findAll(filters?: ExtratoFilters): Promise<Extrato[]> {
    try {
      const queryFilters: any = {}

      if (filters) {
        if (filters.matricula) queryFilters.matricula = filters.matricula
        if (filters.nome)
          queryFilters.nome = { $regex: filters.nome, $options: 'i' }
        if (filters.mes) queryFilters.mes = filters.mes
        if (filters.ano) queryFilters.ano = filters.ano
        if (filters.categoria) queryFilters.categoria = filters.categoria
      }

      const extratos = await ExtratoModel.find(queryFilters)
      return extratos.map((extrato) => this.mapToEntity(extrato))
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Erro ao buscar extratos',
      )
    }
  }

  async update(id: string, extrato: Partial<Extrato>): Promise<Extrato | null> {
    try {
      const updatedExtrato = await ExtratoModel.findByIdAndUpdate(id, extrato, {
        new: true,
      })
      return updatedExtrato ? this.mapToEntity(updatedExtrato) : null
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Erro ao atualizar extrato',
      )
    }
  }

  async findByPeriod(filters: ExtratoFilters): Promise<Extrato[]> {
    try {
      const queryFilters: any = {}

      // Adicionar filtros básicos
      if (filters.matricula) queryFilters.matricula = filters.matricula
      if (filters.nome)
        queryFilters.nome = { $regex: filters.nome, $options: 'i' }
      if (filters.categoria) queryFilters.categoria = filters.categoria

      // Construir filtro por período
      if (filters.dataInicio && filters.dataFim) {
        const startYear = filters.dataInicio.getFullYear().toString()
        const endYear = filters.dataFim.getFullYear().toString()

        // Se for o mesmo ano
        if (startYear === endYear) {
          const startMonth = filters.dataInicio.getMonth()
          const endMonth = filters.dataFim.getMonth()
          const mesesPeriodo = []

          for (let i = startMonth; i <= endMonth; i++) {
            mesesPeriodo.push(getMesAbreviado(i))
          }

          queryFilters.ano = startYear
          queryFilters.mes = { $in: mesesPeriodo }
        } else {
          // Anos diferentes - usar condição OR
          const orConditions = []

          // Meses do primeiro ano
          const mesesPrimeiroAno = []
          for (let i = filters.dataInicio.getMonth(); i < 12; i++) {
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
          for (let i = 0; i <= filters.dataFim.getMonth(); i++) {
            mesesUltimoAno.push(getMesAbreviado(i))
          }

          if (mesesUltimoAno.length > 0) {
            orConditions.push({
              ano: endYear,
              mes: { $in: mesesUltimoAno },
            })
          }

          // Adicionar condição OR aos filtros
          if (orConditions.length > 0) {
            queryFilters.$or = orConditions
          }
        }
      }

      const extratos = await ExtratoModel.find(queryFilters)
      return extratos.map((extrato) => this.mapToEntity(extrato))
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao buscar extratos por período',
      )
    }
  }

  async findByTomador(
    tomador: string,
    filters?: ExtratoFilters,
  ): Promise<Extrato[]> {
    try {
      const queryFilters: any = { 'trabalhos.tomador': tomador }

      if (filters) {
        if (filters.matricula) queryFilters.matricula = filters.matricula
        if (filters.nome)
          queryFilters.nome = { $regex: filters.nome, $options: 'i' }
        if (filters.mes) queryFilters.mes = filters.mes
        if (filters.ano) queryFilters.ano = filters.ano
        if (filters.categoria) queryFilters.categoria = filters.categoria
      }

      const extratos = await ExtratoModel.find(queryFilters)
      return extratos.map((extrato) => this.mapToEntity(extrato))
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : 'Erro ao buscar extratos por tomador',
      )
    }
  }

  async getResumoMensal(mes: string, ano: string): Promise<any> {
    try {
      const resultados = await ExtratoModel.aggregate([
        { $match: { mes, ano } },
        {
          $group: {
            _id: { mes: '$mes', ano: '$ano' },
            totalBaseCalculo: { $sum: '$folhasComplementos.baseDeCalculo' },
            totalLiquido: { $sum: '$folhasComplementos.liquido' },
            totalFGTS: { $sum: '$folhasComplementos.fgts' },
            totalTrabalhos: { $sum: { $size: '$trabalhos' } },
            totalTrabalhadores: { $sum: 1 },
          },
        },
      ])

      return resultados[0] || null
    } catch (error) {
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Erro ao obter resumo mensal',
      )
    }
  }

  private mapToEntity(document: any): Extrato {
    const extrato = document.toObject ? document.toObject() : document

    return {
      id: extrato._id.toString(),
      matricula: extrato.matricula,
      nome: extrato.nome,
      mes: extrato.mes,
      ano: extrato.ano,
      categoria: extrato.categoria,
      trabalhos: extrato.trabalhos,
      folhasComplementos: extrato.folhasComplementos,
      revisadas: extrato.revisadas,
      createdAt: extrato.createdAt,
      updatedAt: extrato.updatedAt,
    }
  }
}

import {
  IExtratoRepository,
  ExtratoFilters,
} from '../../../domain/repositories/interfaces/IExtratoRepository'
import { ExtratoListItemDTO } from '../../dtos/ExtratoDTO'

export class ListExtratosUseCase {
  private readonly extratoRepository: IExtratoRepository

  constructor(extratoRepository: IExtratoRepository) {
    this.extratoRepository = extratoRepository
  }

  async execute(filters?: ExtratoFilters): Promise<ExtratoListItemDTO[]> {
    let extratos

    // Se há filtro por tomador, usar método específico
    if (filters?.tomador) {
      extratos = await this.extratoRepository.findByTomador(
        filters.tomador,
        filters,
      )
    } else {
      extratos = await this.extratoRepository.findAll(filters)
    }

    // Mapear para DTO de listagem
    return extratos.map((extrato) => ({
      id: extrato.id as string,
      matricula: extrato.matricula,
      nome: extrato.nome,
      mes: extrato.mes,
      ano: extrato.ano,
      categoria: extrato.categoria,
      totalTrabalhos: extrato.trabalhos?.length || 0,
      valorTotal: extrato.folhasComplementos?.liquido || 0,
    }))
  }
}

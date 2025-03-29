import {
  IExtratoRepository,
  ExtratoFilters,
} from '../../../domain/repositories/interfaces/IExtratoRepository'
import { ExtratoListItemDTO } from '../../dtos/ExtratoDTO'

export class ListExtratosByPeriodUseCase {
  private readonly extratoRepository: IExtratoRepository

  constructor(extratoRepository: IExtratoRepository) {
    this.extratoRepository = extratoRepository
  }

  async execute(filters: ExtratoFilters): Promise<ExtratoListItemDTO[]> {
    const extratos = await this.extratoRepository.findByPeriod(filters)

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

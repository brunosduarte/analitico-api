import { IExtratoRepository } from '../../../domain/repositories/interfaces/IExtratoRepository'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import { ValidationError } from '../../../domain/errors/ValidationError'

export class GetResumoMensalUseCase {
  private readonly extratoRepository: IExtratoRepository

  constructor(extratoRepository: IExtratoRepository) {
    this.extratoRepository = extratoRepository
  }

  async execute(mes: string, ano: string): Promise<any> {
    if (!mes || !ano) {
      throw new ValidationError('Mês e ano são obrigatórios')
    }

    const resumo = await this.extratoRepository.getResumoMensal(mes, ano)

    if (!resumo) {
      throw new NotFoundError('Resumo do período')
    }

    return resumo
  }
}

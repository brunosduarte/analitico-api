import { IExtratoRepository } from '../../../domain/repositories/interfaces/IExtratoRepository'
import { ValidationError } from '../../../domain/errors/ValidationError'

export class GetTrabalhosByTomadorUseCase {
  private readonly extratoRepository: IExtratoRepository

  constructor(extratoRepository: IExtratoRepository) {
    this.extratoRepository = extratoRepository
  }

  async execute(tomador: string): Promise<any[]> {
    if (!tomador) {
      throw new ValidationError('Código do tomador é obrigatório')
    }

    return this.extratoRepository.findByTomador(tomador)
  }
}

import { IExtratoRepository } from '../../../domain/repositories/interfaces/IExtratoRepository'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import { ExtratoDTO } from '../../dtos/ExtratoDTO'

export class FindExtratoByIdUseCase {
  private readonly extratoRepository: IExtratoRepository

  constructor(extratoRepository: IExtratoRepository) {
    this.extratoRepository = extratoRepository
  }

  async execute(id: string): Promise<ExtratoDTO> {
    const extrato = await this.extratoRepository.findById(id)

    if (!extrato) {
      throw new NotFoundError('Extrato')
    }

    return extrato
  }
}

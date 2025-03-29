import { IAnalyticsRepository } from '../../../domain/repositories/interfaces/IAnalyticsRepository'
import { ValidationError } from '../../../domain/errors/ValidationError'
import { TomadorAnalyticsDTO } from '../../dtos/AnalyticsDTO'

export class GetTomadoresAnalyticsUseCase {
  private analyticsRepository: IAnalyticsRepository

  constructor(analyticsRepository: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository
  }

  async execute(extratoIds: string[]): Promise<TomadorAnalyticsDTO[]> {
    if (!extratoIds || extratoIds.length === 0) {
      throw new ValidationError(
        'É necessário informar pelo menos um ID de extrato',
      )
    }

    return this.analyticsRepository.getTomadoresAnalytics(extratoIds)
  }
}

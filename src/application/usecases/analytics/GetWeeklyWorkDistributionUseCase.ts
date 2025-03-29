import { IAnalyticsRepository } from '../../../domain/repositories/interfaces/IAnalyticsRepository'
import { WeeklyWorkItemDTO, DateRangeDTO } from '../../dtos/AnalyticsDTO'

export class GetWeeklyWorkDistributionUseCase {
  private analyticsRepository: IAnalyticsRepository

  constructor(analyticsRepository: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository
  }

  async execute(dateRange: DateRangeDTO): Promise<WeeklyWorkItemDTO[]> {
    return this.analyticsRepository.getWeeklyWorkDistribution(
      dateRange.from,
      dateRange.to,
    )
  }
}

import { IAnalyticsRepository } from '../../../domain/repositories/interfaces/IAnalyticsRepository'
import { ChartDataItemDTO, DateRangeDTO } from '../../dtos/AnalyticsDTO'

export class GetShiftDistributionUseCase {
  private analyticsRepository: IAnalyticsRepository

  constructor(analyticsRepository: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository
  }

  async execute(dateRange: DateRangeDTO): Promise<ChartDataItemDTO[]> {
    return this.analyticsRepository.getShiftDistribution(
      dateRange.from,
      dateRange.to,
    )
  }
}

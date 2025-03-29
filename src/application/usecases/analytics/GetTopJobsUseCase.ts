import { IAnalyticsRepository } from '../../../domain/repositories/interfaces/IAnalyticsRepository'
import { ChartDataItemDTO, DateRangeDTO } from '../../dtos/AnalyticsDTO'

export class GetTopJobsUseCase {
  private analyticsRepository: IAnalyticsRepository

  constructor(analyticsRepository: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository
  }

  async execute(
    dateRange: DateRangeDTO,
    limit: number = 10,
  ): Promise<ChartDataItemDTO[]> {
    return this.analyticsRepository.getTopJobs(
      dateRange.from,
      dateRange.to,
      limit,
    )
  }
}

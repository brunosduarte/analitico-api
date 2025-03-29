import { IAnalyticsRepository } from '../../../domain/repositories/interfaces/IAnalyticsRepository'
import { ChartDataItemDTO, DateRangeDTO } from '../../dtos/AnalyticsDTO'

export class GetReturnsDataUseCase {
  private analyticsRepository: IAnalyticsRepository

  constructor(analyticsRepository: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository
  }

  async execute(dateRange: DateRangeDTO): Promise<ChartDataItemDTO[]> {
    return this.analyticsRepository.getReturnsData(dateRange.from, dateRange.to)
  }
}

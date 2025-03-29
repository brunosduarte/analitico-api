import { IAnalyticsRepository } from '../../../domain/repositories/interfaces/IAnalyticsRepository'
import { DashboardSummaryDTO, DateRangeDTO } from '../../dtos/AnalyticsDTO'

export class GetDashboardSummaryUseCase {
  private analyticsRepository: IAnalyticsRepository

  constructor(analyticsRepository: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository
  }

  async execute(dateRange: DateRangeDTO): Promise<DashboardSummaryDTO> {
    const summary = await this.analyticsRepository.getDashboardSummary(
      dateRange.from,
      dateRange.to,
    )

    return {
      ...summary,
      diasTrabalhados: 0, // TODO: Calculate actual value based on business requirements
    }
  }
}

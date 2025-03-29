import {
  createContainer,
  asClass,
  // asValue,
  InjectionMode,
} from 'awilix'
import { IExtratoRepository } from '../../domain/repositories/interfaces/IExtratoRepository'
import { IAnalyticsRepository } from '../../domain/repositories/interfaces/IAnalyticsRepository'
import { IPDFExtractorService } from '../../domain/services/interfaces/IPDFExtractorService'

import { MongoExtratoRepository } from '../../infrastructure/database/mongoose/repositories/MongoExtratoRepository'
import { MongoAnalyticsRepository } from '../../infrastructure/database/mongoose/repositories/MongoAnalyticsRepository'
import { PDFExtractorService } from '../../infrastructure/services/PDFExtractorService'
import { DiskStorageService } from '../../infrastructure/services/storage/DiskStorageService'

import { CreateExtratoUseCase } from '../../application/usecases/extrato/CreateExtratoUseCase'
import { FindExtratoByIdUseCase } from '../../application/usecases/extrato/FindExtratoByIdUseCase'
import { ListExtratosUseCase } from '../../application/usecases/extrato/ListExtratosUseCase'
import { ListExtratosByPeriodUseCase } from '../../application/usecases/extrato/ListExtratosByPeriodUseCase'
import { GetResumoMensalUseCase } from '../../application/usecases/extrato/GetResumoMensalUseCase'
import { GetTrabalhosByTomadorUseCase } from '../../application/usecases/extrato/GetTrabalhosByTomadorUseCase'

import { GetTomadoresAnalyticsUseCase } from '../../application/usecases/analytics/GetTomadoresAnalyticsUseCase'
import { GetSalaryBreakdownUseCase } from '../../application/usecases/analytics/GetSalaryBreakdownUseCase'
import { GetShiftDistributionUseCase } from '../../application/usecases/analytics/GetShiftDistributionUseCase'
import { GetWeeklyWorkDistributionUseCase } from '../../application/usecases/analytics/GetWeeklyWorkDistributionUseCase'
import { GetTopJobsUseCase } from '../../application/usecases/analytics/GetTopJobsUseCase'
import { GetReturnsDataUseCase } from '../../application/usecases/analytics/GetReturnsDataUseCase'
import { GetDashboardSummaryUseCase } from '../../application/usecases/analytics/GetDashboardSummaryUseCase'

import { ExtratoController } from '../../presentation/controllers/ExtratoController'
import { AnalyticsController } from '../../presentation/controllers/AnalyticsController'

// Criar container de injeção de dependências
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
})

// Registrar serviços
container.register({
  // Repositories
  extratoRepository: asClass<IExtratoRepository>(
    MongoExtratoRepository,
  ).singleton(),
  analyticsRepository: asClass<IAnalyticsRepository>(
    MongoAnalyticsRepository,
  ).singleton(),

  // Services
  pdfExtractorService:
    asClass<IPDFExtractorService>(PDFExtractorService).singleton(),
  diskStorageService: asClass(DiskStorageService).singleton(),

  // Use Cases - Extrato
  createExtratoUseCase: asClass(CreateExtratoUseCase),
  findExtratoByIdUseCase: asClass(FindExtratoByIdUseCase),
  listExtratosUseCase: asClass(ListExtratosUseCase),
  listExtratosByPeriodUseCase: asClass(ListExtratosByPeriodUseCase),
  getResumoMensalUseCase: asClass(GetResumoMensalUseCase),
  getTrabalhosByTomadorUseCase: asClass(GetTrabalhosByTomadorUseCase),

  // Use Cases - Analytics
  getTomadoresAnalyticsUseCase: asClass(GetTomadoresAnalyticsUseCase),
  getSalaryBreakdownUseCase: asClass(GetSalaryBreakdownUseCase),
  getShiftDistributionUseCase: asClass(GetShiftDistributionUseCase),
  getWeeklyWorkDistributionUseCase: asClass(GetWeeklyWorkDistributionUseCase),
  getTopJobsUseCase: asClass(GetTopJobsUseCase),
  getReturnsDataUseCase: asClass(GetReturnsDataUseCase),
  getDashboardSummaryUseCase: asClass(GetDashboardSummaryUseCase),

  // Controllers
  ExtratoController: asClass(ExtratoController),
  AnalyticsController: asClass(AnalyticsController),
})

export { container }

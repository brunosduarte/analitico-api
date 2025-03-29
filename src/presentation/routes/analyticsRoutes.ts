import { Router } from 'express'
import { AnalyticsController } from '../controllers/AnalyticsController'
import { asyncHandler } from '../middlewares/asyncHandler'
import { container } from '../../shared/container'

const router = Router()

// Instanciar o controller com suas dependências
const analyticsController = container.resolve<AnalyticsController>(
  'AnalyticsController',
)

// Rota para obter análise de tomadores
router.get(
  '/tomadores',
  asyncHandler((req, res, next) =>
    analyticsController.getTomadoresAnalytics(req, res, next),
  ),
)

// Rota para obter distribuição salarial
router.get(
  '/salario-breakdown',
  asyncHandler((req, res, next) =>
    analyticsController.getSalaryBreakdown(req, res, next),
  ),
)

// Rota para obter distribuição de turnos
router.get(
  '/turnos',
  asyncHandler((req, res, next) =>
    analyticsController.getShiftDistribution(req, res, next),
  ),
)

// Rota para obter distribuição semanal de trabalhos
router.get(
  '/trabalhos-semanais',
  asyncHandler((req, res, next) =>
    analyticsController.getWeeklyWorkDistribution(req, res, next),
  ),
)

// Rota para obter top trabalhos
router.get(
  '/top-trabalhos',
  asyncHandler((req, res, next) =>
    analyticsController.getTopJobs(req, res, next),
  ),
)

// Rota para obter dados de retornos
router.get(
  '/retornos',
  asyncHandler((req, res, next) =>
    analyticsController.getReturnsData(req, res, next),
  ),
)

// Nova rota para obter distribuição por função
router.get(
  '/funcoes',
  asyncHandler((req, res, next) =>
    analyticsController.getFunctionDistribution(req, res, next),
  ),
)

// Rota para obter resumo do dashboard
router.get(
  '/dashboard-resumo',
  asyncHandler((req, res, next) =>
    analyticsController.getDashboardSummary(req, res, next),
  ),
)

export default router

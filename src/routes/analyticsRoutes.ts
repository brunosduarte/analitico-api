import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();

// Rota para obter análise de tomadores
router.get('/tomadores', AnalyticsController.getTomadoresAnalytics);

// Rota para obter distribuição salarial
router.get('/salario-breakdown', AnalyticsController.getSalaryBreakdown);

// Rota para obter distribuição de turnos
router.get('/turnos', AnalyticsController.getShiftDistribution);

// Rota para obter distribuição semanal de trabalhos
router.get('/trabalhos-semanais', AnalyticsController.getWeeklyWorkDistribution);

// Rota para obter top trabalhos
router.get('/top-trabalhos', AnalyticsController.getTopJobs);

// Rota para obter dados de retornos
router.get('/retornos', AnalyticsController.getReturnsData);

// Rota para obter resumo do dashboard
router.get('/dashboard-resumo', AnalyticsController.getDashboardSummary);

export default router;
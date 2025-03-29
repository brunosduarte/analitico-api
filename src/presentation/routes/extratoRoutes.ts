import { Router } from 'express'
import { ExtratoController } from '../controllers/ExtratoController'
import { uploadMiddleware, validateUploadedFile } from '../middlewares/upload'
import { asyncHandler } from '../middlewares/asyncHandler'
import { container } from '../../shared/container'

const router = Router()

// Instanciar o controller com suas dependências
const extratoController =
  container.resolve<ExtratoController>('ExtratoController')

// Rota para upload de extrato analítico
router.post(
  '/analitico',
  uploadMiddleware,
  validateUploadedFile,
  asyncHandler((req, res, next) =>
    extratoController.uploadExtratoAnalitico(req, res, next),
  ),
)

// Rota para listar extratos com filtros opcionais
router.get(
  '/analitico',
  asyncHandler((req, res, next) =>
    extratoController.listarExtratos(req, res, next),
  ),
)

// Rota para obter um extrato específico por ID
router.get(
  '/analitico/:id',
  asyncHandler((req, res, next) =>
    extratoController.obterExtratoPorId(req, res, next),
  ),
)

// Rota para obter trabalhos por tomador
router.get(
  '/trabalhos/tomador/:tomador',
  asyncHandler((req, res, next) =>
    extratoController.obterTrabalhosPorTomador(req, res, next),
  ),
)

// Rota para obter resumo mensal
router.get(
  '/resumo/:mes/:ano',
  asyncHandler((req, res, next) =>
    extratoController.obterResumoMensal(req, res, next),
  ),
)

// Nova rota para consultar extratos por período
router.get(
  '/periodo',
  asyncHandler((req, res, next) =>
    extratoController.listarExtratosPorPeriodo(req, res, next),
  ),
)

export default router

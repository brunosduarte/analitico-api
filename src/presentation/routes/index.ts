import { Router } from 'express'
import extratoRoutes from './extratoRoutes'
import analyticsRoutes from './analyticsRoutes'

const router = Router()

router.use('/', extratoRoutes)
router.use('/analise', analyticsRoutes)

// Rota de verificação de saúde
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Serviço operando normalmente',
  })
})

export default router

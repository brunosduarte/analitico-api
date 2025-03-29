import express from 'express'
import cors from 'cors'
import routes from './routes'
import { errorHandler } from './middlewares/errorHandler'

export function createServer() {
  const app = express()

  // Middlewares
  app.use(cors())
  app.use(express.json())

  // Rotas
  app.use(routes)

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorHandler)

  // Tratamento de exceções não capturadas
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Não encerre o processo na produção, apenas log o erro
  })

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    // Em produção, você poderia usar um serviço de monitoramento para notificar administradores
    // Não encerre o processo na produção para manter o serviço disponível
  })

  return app
}

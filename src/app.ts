import 'dotenv/config'
import { createServer } from './presentation/server'
import { connectDB } from './infrastructure/database/mongoose/connection'
import { DEFAULT_PORT } from './shared/constants'

// Função para inicializar a aplicação
async function bootstrap() {
  try {
    // Conectar ao banco de dados
    await connectDB()
    console.log('MongoDB conectado com sucesso')

    // Criar servidor
    const app = createServer()
    const PORT = process.env.PORT || DEFAULT_PORT

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })

    // Tratamento de erros não capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    })

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error)
      process.exit(1)
    })

    return app
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error)
    process.exit(1)
  }
}

// Iniciar a aplicação
if (process.env.NODE_ENV !== 'test') {
  bootstrap()
}

export { bootstrap }

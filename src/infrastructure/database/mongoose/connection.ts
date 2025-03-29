import mongoose from 'mongoose'
import { DatabaseError } from '../../../domain/errors/DatabaseError'

export const connectDB = async (): Promise<void> => {
  try {
    const mongodbUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/extratos_portuarios'

    await mongoose.connect(mongodbUri)

    console.log('MongoDB conectado com sucesso')
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error)
    throw new DatabaseError(
      error instanceof Error
        ? error.message
        : 'Erro desconhecido na conexão com o banco de dados',
    )
  }
}

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect()
  console.log('MongoDB desconectado')
}

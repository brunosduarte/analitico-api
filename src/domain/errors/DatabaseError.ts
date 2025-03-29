import { AppError } from './AppError'

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(`Erro no banco de dados: ${message}`, 500)
  }
}

import { AppError } from './AppError'

export class PDFExtractionError extends AppError {
  constructor(message: string) {
    super(`Erro ao extrair dados do PDF: ${message}`, 500)
  }
}

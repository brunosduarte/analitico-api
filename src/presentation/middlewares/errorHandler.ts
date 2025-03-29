import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../domain/errors/AppError'
import { ValidationError } from '../../domain/errors/ValidationError'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import { PDFExtractionError } from '../../domain/errors/PDFExtractionError'
import { DatabaseError } from '../../domain/errors/DatabaseError'

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Response {
  // Log do erro para debugging
  console.error(`[Error] ${error.name}: ${error.message}`)
  console.error(error.stack)

  // Verificar se é um erro conhecido
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    })
  }

  // Erros específicos
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message,
    })
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  if (error instanceof PDFExtractionError) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }

  // Verificar erros específicos de multer
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Erro no upload do arquivo',
      error: error.message,
    })
  }

  // Verificar erros de ZOD
  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      error: error.message,
    })
  }

  // Para erros desconhecidos
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  })
}

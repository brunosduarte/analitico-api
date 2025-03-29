import { Request, Response, NextFunction } from 'express'
import { DiskStorageService } from '../../infrastructure/services/storage/DiskStorageService'
import { ValidationError } from '../../domain/errors/ValidationError'

// Instanciar o serviço de armazenamento
const diskStorage = new DiskStorageService()

// Configurar o middleware de upload
export const uploadMiddleware = diskStorage.configureMulter().single('arquivo')

// Middleware para validar o arquivo enviado
export const validateUploadedFile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) {
    throw new ValidationError('Nenhum arquivo enviado')
  }

  if (req.file.mimetype !== 'application/pdf') {
    throw new ValidationError('Apenas arquivos PDF são aceitos')
  }

  next()
}

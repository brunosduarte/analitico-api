import { Request, Response, NextFunction } from 'express'
import { DiskStorageService } from '../../infrastructure/services/storage/DiskStorageService'
import { ValidationError } from '../../domain/errors/ValidationError'

const diskStorage = new DiskStorageService()

export const uploadMiddleware = diskStorage.configureMulter().single('arquivo')

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

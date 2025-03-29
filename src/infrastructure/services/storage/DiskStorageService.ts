import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { ValidationError } from '../../../domain/errors/ValidationError'

export class DiskStorageService {
  private uploadDir: string

  constructor(uploadDir: string = path.join(process.cwd(), 'uploads')) {
    this.uploadDir = uploadDir
    this.ensureDirectoryExists()
  }

  configureMulter(): multer.Multer {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir)
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
      },
    })

    // Filtro para aceitar apenas arquivos PDF
    const fileFilter = (
      req: any,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback,
    ) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true)
      } else {
        cb(new ValidationError('Apenas arquivos PDF são aceitos'))
      }
    }

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async removeFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      console.error(`Erro ao remover arquivo ${filePath}:`, error)
    }
  }
}

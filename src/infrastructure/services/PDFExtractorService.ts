import { IPDFExtractorService } from '../../domain/services/interfaces/IPDFExtractorService'
import { Extrato } from '../../domain/entities/Extrato'
import { parseExtratoAnalitico } from '../utils/pdf/PDFParser'
import { PDFExtractionError } from '../../domain/errors/PDFExtractionError'
import * as fs from 'fs'

export class PDFExtractorService implements IPDFExtractorService {
  async extractDataFromPDF(filePath: string): Promise<Extrato> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new PDFExtractionError(`Arquivo não encontrado: ${filePath}`)
      }

      const extratoData = await parseExtratoAnalitico(filePath)

      return extratoData
    } catch (error) {
      if (error instanceof PDFExtractionError) {
        throw error
      }
      throw new PDFExtractionError(
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar extrato PDF',
      )
    }
  }
}

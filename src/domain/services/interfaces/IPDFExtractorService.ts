import { Extrato } from '../../entities/Extrato'

export interface IPDFExtractorService {
  extractDataFromPDF(filePath: string): Promise<Extrato>
}

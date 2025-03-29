// import { Extrato } from '../../../domain/entities/Extrato'
import { IExtratoRepository } from '../../../domain/repositories/interfaces/IExtratoRepository'
import { IPDFExtractorService } from '../../../domain/services/interfaces/IPDFExtractorService'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import { ExtratoDTO } from '../../dtos/ExtratoDTO'

export class CreateExtratoUseCase {
  private readonly extratoRepository: IExtratoRepository
  private readonly pdfExtractorService: IPDFExtractorService

  constructor(
    extratoRepository: IExtratoRepository,
    pdfExtractorService: IPDFExtractorService,
  ) {
    this.extratoRepository = extratoRepository
    this.pdfExtractorService = pdfExtractorService
  }

  async execute(filePath: string): Promise<ExtratoDTO> {
    // Extrair dados do PDF
    const extractedData =
      await this.pdfExtractorService.extractDataFromPDF(filePath)

    // Verificar se o extrato já existe
    const existingExtrato = await this.extratoRepository.findByMatriculaMesAno(
      extractedData.matricula,
      extractedData.mes,
      extractedData.ano,
    )

    if (existingExtrato) {
      // Atualizar o extrato existente
      const updatedExtrato = await this.extratoRepository.update(
        existingExtrato.id as string,
        extractedData,
      )

      if (!updatedExtrato) {
        throw new NotFoundError('Extrato')
      }

      return updatedExtrato
    }

    // Criar novo extrato
    const newExtrato = await this.extratoRepository.create(extractedData)
    return newExtrato
  }
}

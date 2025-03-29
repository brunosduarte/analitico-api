import { TrabalhoDTO } from './TrabalhoDTO'
import { ResumoExtratoDTO } from './ResumoExtratoDTO'

export interface ExtratoDTO {
  id?: string
  matricula: string
  nome: string
  mes: string
  ano: string
  categoria: string
  trabalhos: TrabalhoDTO[]
  folhasComplementos: ResumoExtratoDTO
  revisadas: ResumoExtratoDTO
  createdAt?: Date
  updatedAt?: Date
}

export interface ExtratoListItemDTO {
  id: string
  matricula: string
  nome: string
  mes: string
  ano: string
  categoria: string
  totalTrabalhos: number
  valorTotal: number
}

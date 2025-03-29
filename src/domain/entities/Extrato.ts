import { Trabalho } from './Trabalho'
import { ResumoExtrato } from './ResumoExtrato'

export interface Extrato {
  id?: string
  matricula: string
  nome: string
  mes: string
  ano: string
  categoria: string
  trabalhos: Trabalho[]
  folhasComplementos: ResumoExtrato
  revisadas: ResumoExtrato
  createdAt?: Date
  updatedAt?: Date
}

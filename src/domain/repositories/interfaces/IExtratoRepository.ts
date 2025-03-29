import { Extrato } from '../../entities/Extrato'

export interface ExtratoFilters {
  matricula?: string
  nome?: string
  mes?: string
  ano?: string
  categoria?: string
  tomador?: string
  dataInicio?: Date
  dataFim?: Date
}

export interface IExtratoRepository {
  create(extrato: Extrato): Promise<Extrato>
  findById(id: string): Promise<Extrato | null>
  findByMatriculaMesAno(
    matricula: string,
    mes: string,
    ano: string,
  ): Promise<Extrato | null>
  findAll(filters?: ExtratoFilters): Promise<Extrato[]>
  update(id: string, extrato: Partial<Extrato>): Promise<Extrato | null>
  findByPeriod(filters: ExtratoFilters): Promise<Extrato[]>
  findByTomador(tomador: string, filters?: ExtratoFilters): Promise<Extrato[]>
  getResumoMensal(mes: string, ano: string): Promise<any>
}

export const UPLOAD_DIR = 'uploads'
export const DEFAULT_PORT = 3000
export const DEFAULT_MONGODB_URI =
  'mongodb://localhost:27017/extratos_portuarios'

export const MESES_ABREV = {
  JAN: 'Jan',
  FEV: 'Fev',
  MAR: 'Mar',
  ABR: 'Abr',
  MAI: 'Mai',
  JUN: 'Jun',
  JUL: 'Jul',
  AGO: 'Ago',
  SET: 'Set',
  OUT: 'Out',
  NOV: 'Nov',
  DEZ: 'Dez',
}

export const MESES_NOME: Record<string, string> = {
  JAN: 'Janeiro',
  FEV: 'Fevereiro',
  MAR: 'Março',
  ABR: 'Abril',
  MAI: 'Maio',
  JUN: 'Junho',
  JUL: 'Julho',
  AGO: 'Agosto',
  SET: 'Setembro',
  OUT: 'Outubro',
  NOV: 'Novembro',
  DEZ: 'Dezembro',
}

export const MESES_NUMERO: Record<string, string> = {
  JAN: '01',
  FEV: '02',
  MAR: '03',
  ABR: '04',
  MAI: '05',
  JUN: '06',
  JUL: '07',
  AGO: '08',
  SET: '09',
  OUT: '10',
  NOV: '11',
  DEZ: '12',
}

export const MESES_ORDEM = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
]

export const NUMERO_MESES: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro',
}

export const FUNCTION_NAMES: Record<string, string> = {
  '101': 'CM Geral',
  '103': 'CM Porão',
  '104': 'CM Conexo',
  '431': 'Motorista VL',
  '521': 'Operador PC',
  '527': 'Operador EH',
  '801': 'Soldado',
  '802': 'Sinaleiro',
  '803': 'Conexo',
}

export const FERIADOS_NACIONAIS_FIXOS = [
  '01/01', // Confraternização Universal
  '21/04', // Tiradentes
  '01/05', // Dia do Trabalho
  '07/09', // Independência
  '12/10', // Nossa Senhora Aparecida
  '02/11', // Finados
  '15/11', // Proclamação da República
  '20/11', // Consciência Negra
  '25/12', // Natal
]

export interface FeriadosAnuais {
  [ano: string]: string[] // Array de datas no formato 'dd/mm'
}

export const FERIADOS_NACIONAIS_MOVEIS: FeriadosAnuais = {
  '2022': [
    '01/03', // Carnaval
    '15/04', // Sexta-feira Santa
    '17/04', // Páscoa
    '08/05', // Dia das Mães
    '16/06', // Corpus Christi
    '14/08', // Dia dos Pais
  ],
  '2023': [
    '21/02', // Carnaval
    '07/04', // Sexta-feira Santa
    '09/04', // Páscoa
    '14/05', // Dia das Mães
    '08/06', // Corpus Christi
    '13/08', // Dia dos Pais
  ],
  '2024': [
    '13/02', // Carnaval
    '29/03', // Sexta-feira Santa
    '31/03', // Páscoa
    '12/05', // Dia das Mães
    '30/05', // Corpus Christi
    '11/08', // Dia dos Pais
  ],
  '2025': [
    '04/03', // Carnaval
    '18/04', // Sexta-feira Santa
    '20/04', // Páscoa
    '11/05', // Dia das Mães
    '19/06', // Corpus Christi
    '10/08', // Dia dos Pais
  ],
  '2026': [
    '17/02', // Carnaval
    '03/04', // Sexta-feira Santa
    '05/04', // Páscoa
    '10/05', // Dia das Mães
    '04/06', // Corpus Christi
    '09/08', // Dia dos Pais
  ],
  '2027': [
    '09/02', // Carnaval
    '26/00', // Sexta-feira Santa
    '28/03', // Páscoa
    '27/05', // Dia das Mães
    '09/05', // Corpus Christi
    '08/08', // Dia dos Pais
  ],
}

export const TOMADORES_CONHECIDOS = [
  'AGM',
  'SAGRES',
  'TECON',
  'TERMASA',
  'ROCHA RS',
  'LIVENPORT',
  'BIANCHINI',
  'SERRA MOR',
  'RGLP',
  'ORION',
  'CTIL',
]

export interface DrawInfo {
  drawId: string
  drawCode: string | null
  openDate: string
  category: number
}

export interface GroupHistory {
  id: number
  name: string
  category: number
  type: number
  groupLevel: number
  groupStatus: number
  drawInfo: DrawInfo
  percentageOfShares: number
  moneyOfShares: number
  numberOfMembers: number
  numberOfTickets: number
  procress: number
  timeCutOff: string
  createTime: string
  createBy: string
  statusWin: number
  prize: number
  levelWin: number
  prizeWinAmount: number
  prizeWinAfterTax: number
  incomeTax: number
  prizeBonus: number
  orderStatus: number
  enableLeaveGroup: number
  amountCashback: number
}

export interface ApiResponse {
  result: number
  resultDesc: string
  requestId: number
  data?: GroupHistory[]
  total?: number
  totalElements?: number
}

export type StatusFilter = 'all' | '1' | '2' | '3'

export interface ParsedGameName {
  game: string
  type: string
}

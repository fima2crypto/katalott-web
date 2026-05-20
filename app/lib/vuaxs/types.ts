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
  // Fields từ DB (chỉ có khi load offline)
  ticketImagePath?: string | null
  numberFinish?: number[]
  updatedAt?: string
}

export interface LottoNumber {
  num: number
  status: number
}

export interface NumberInfo {
  id: number
  status: number
  percentageOfShares: number
  moneyOfShares: number
  numbers: LottoNumber[]
  prizeAmount: number | null
}

export interface TicketInGroup {
  id: number
  userId: string
  percentageOfShares: number
  moneyOfShares: number
  currentMember: number // 1 = là mình
  prizeWinAmount: number
  prizeWinAfterTax: number
  numberInfos: NumberInfo[]
}

export interface NumberFinish {
  num: number
  status: number
}

export interface GroupDetail {
  id: number
  name: string
  category: number
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
  statusWin: number
  prizeWinAmount: number
  prizeWinAfterTax: number
  incomeTax: number
  listTicketInGroup: TicketInGroup[]
  numberFinish: NumberFinish[]
  ticket_image: string | null
  ticket_image_path?: string | null
  drawStatus: number
  timeClose: string
}

export interface ApiResponse {
  result: number
  resultDesc: string
  requestId?: number
  data?: GroupHistory[] | GroupDetail | any
  total?: number
  totalElements?: number
}

export type StatusFilter = 'all' | '1' | '2' | '3'

export interface ParsedGameName {
  game: string
  type: string
}

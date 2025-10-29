export type CalendarMode = 'all' | 'biz'

export interface ScheduleRow {
  key: string
  label: string
  until: string
  earnings: number
  finalAmount: number
}

export function computeDailyRate(
  annualCdiPct: number,
  percentOfCdi: number,
  mode: CalendarMode,
): number {
  const annualRate = (annualCdiPct / 100) * (percentOfCdi / 100) // decimal
  const baseDays = mode === 'all' ? 365 : 252
  return Math.pow(1 + annualRate, 1 / baseDays) - 1
}

export function computeCdiSchedule(params: {
  principal: number
  annualCdiPct: number
  percentOfCdi: number
  mode: CalendarMode
  startDate: Date
}): ScheduleRow[] {
  const { principal, annualCdiPct, percentOfCdi, mode, startDate } = params
  const dailyRate = computeDailyRate(annualCdiPct, percentOfCdi, mode)
  const fmt = new Intl.DateTimeFormat('pt-BR')

  const allPeriods = [
    { key: 'w1', label: '1 semana', days: 7 },
    { key: 'w2', label: '2 semanas', days: 14 },
    { key: 'w3', label: '3 semanas', days: 21 },
    { key: 'w4', label: '4 semanas', days: 28 },
    { key: 'm1', label: '1 mês (30d)', days: 30 },
    { key: 'm3', label: '3 meses (90d)', days: 90 },
    { key: 'm6', label: '6 meses (180d)', days: 180 },
    { key: 'y1', label: '1 ano (365d)', days: 365 },
  ] as const

  const bizPeriods = [
    { key: 'w1', label: '1 semana útil', bizDays: 5 },
    { key: 'w2', label: '2 semanas úteis', bizDays: 10 },
    { key: 'w3', label: '3 semanas úteis', bizDays: 15 },
    { key: 'w4', label: '4 semanas úteis', bizDays: 20 },
    { key: 'm1', label: '1 mês útil (21d)', bizDays: 21 },
    { key: 'm3', label: '3 meses úteis (63d)', bizDays: 63 },
    { key: 'm6', label: '6 meses úteis (126d)', bizDays: 126 },
    { key: 'y1', label: '1 ano útil (252d)', bizDays: 252 },
  ] as const

  if (mode === 'all') {
    return allPeriods.map((p) => {
      const n = p.days
      const finalAmount = principal * Math.pow(1 + dailyRate, n)
      const earnings = finalAmount - principal
      const until = fmt.format(addCalendarDays(startDate, n))
      return { key: p.key, label: p.label, until, earnings, finalAmount }
    })
  }

  return bizPeriods.map((p) => {
    const n = p.bizDays
    const finalAmount = principal * Math.pow(1 + dailyRate, n)
    const earnings = finalAmount - principal
    const until = fmt.format(addBusinessDays(startDate, n))
    return { key: p.key, label: p.label, until, earnings, finalAmount }
  })
}

function addCalendarDays(d: Date, days: number): Date {
  const date = new Date(d)
  date.setDate(date.getDate() + days)
  return date
}

function addBusinessDays(d: Date, bizDays: number): Date {
  let left = bizDays
  const date = new Date(d)
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay() // 0 Sun .. 6 Sat
    if (day !== 0 && day !== 6) {
      left -= 1
    }
  }
  return date
}


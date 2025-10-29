import './App.css'
import { useMemo, useState } from 'react'
import { computeCdiSchedule, computeDailyRate, type CalendarMode, type ScheduleRow } from './lib/cdi'
import { Calculator, CalendarDays, Percent, CircleDollarSign, Download, Copy } from 'lucide-react'

function App() {
  const [valor, setValor] = useState<string>('10.000,00')
  const [cdi, setCdi] = useState<string>('13,15')
  const [pct, setPct] = useState<string>('120')
  const [mode, setMode] = useState<CalendarMode>('all')
  const [rows, setRows] = useState<ScheduleRow[] | null>(null)

  const parsed = useMemo(() => {
    const principal = parsePtBRNumber(valor)
    const cdiAnnual = parsePtBRNumber(cdi)
    const pctCdi = parsePtBRNumber(pct)
    return { principal, cdiAnnual, pctCdi }
  }, [valor, cdi, pct])

  const invalid =
    !isFinite(parsed.principal) || parsed.principal <= 0 ||
    !isFinite(parsed.cdiAnnual) || parsed.cdiAnnual <= 0 ||
    !isFinite(parsed.pctCdi) || parsed.pctCdi <= 0

  const dailyRate = useMemo(() => {
    if (invalid) return null
    return computeDailyRate(parsed.cdiAnnual, parsed.pctCdi, mode)
  }, [parsed, mode, invalid])

  function onCalc() {
    if (invalid) {
      setRows(null)
      return
    }
    const schedule = computeCdiSchedule({
      principal: parsed.principal,
      annualCdiPct: parsed.cdiAnnual,
      percentOfCdi: parsed.pctCdi,
      mode,
      startDate: new Date(),
    })
    setRows(schedule)
  }

  function onClear() {
    setValor('')
    setCdi('')
    setPct('')
    setRows(null)
  }

  function onDefaults() {
    setValor('10.000,00')
    setCdi('13,15')
    setPct('120')
    setRows(null)
  }

  function toCsv(): string {
    if (!rows) return ''
    const sep = ';'
    const header = ['Período', 'Até', 'Rendimento (R$)', 'Saldo final (R$)'].join(sep)
    const lines = rows.map(r => [r.label, r.until, formatCurrency(r.earnings), formatCurrency(r.finalAmount)].join(sep))
    return [header, ...lines].join('\n')
  }

  async function onCopyCsv() {
    const csv = toCsv()
    if (!csv) return
    try {
      await navigator.clipboard.writeText(csv)
      // noop toast placeholder
    } catch {
      // ignore
    }
  }

  function onDownloadCsv() {
    const csv = toCsv()
    if (!csv) return
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cdi_simulacao.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
  <div className="min-h-dvh p-4 md:p-8 bg-linear-to-b from-secondary to-background">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="rounded-2xl border bg-card text-card-foreground p-5 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 text-primary p-2">
            <Calculator className="size-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight">Calculadora de CDI</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Simule rendimentos compostos por CDI, com percentuais e calendário diário ou apenas dias úteis.
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="rounded-2xl border bg-card text-card-foreground p-4 md:p-5 space-y-4">
            <h2 className="text-lg font-medium">Parâmetros</h2>

            <div className="space-y-2">
              <label htmlFor="valor" className="text-sm">Valor aplicado (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <input
                  id="valor"
                  className="w-full rounded-lg border bg-background px-9 py-2 text-right"
                  inputMode="decimal"
                  placeholder="10.000,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="cdi" className="text-sm">CDI anual (% a.a.)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="cdi"
                    className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-right"
                    inputMode="decimal"
                    placeholder="13,15"
                    value={cdi}
                    onChange={(e) => setCdi(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="pct" className="text-sm">% do CDI</label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="pct"
                    className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-right"
                    inputMode="decimal"
                    placeholder="120"
                    value={pct}
                    onChange={(e) => setPct(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm">Calendário de rendimento</legend>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="cal"
                    value="all"
                    checked={mode === 'all'}
                    onChange={() => setMode('all')}
                  />
                  <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" /> Todos os dias (365)</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="cal"
                    value="biz"
                    checked={mode === 'biz'}
                    onChange={() => setMode('biz')}
                  />
                  <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" /> Apenas dias úteis (252)</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Assumimos 365 dias corridos/ano ou 252 dias úteis/ano. Feriados não são considerados.
              </p>
            </fieldset>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:opacity-90 transition"
                onClick={onCalc}
                disabled={invalid}
              >
                <span className="inline-flex items-center gap-2"><Calculator className="size-4" /> Calcular</span>
              </button>
              <button
                type="button"
                className="rounded-lg border px-4 py-2 hover:bg-accent transition"
                onClick={onClear}
              >
                Limpar
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                onClick={onDefaults}
              >
                Restaurar padrões
              </button>
            </div>
            {invalid && (
              <p className="text-xs text-destructive">Preencha valores válidos para calcular.</p>
            )}
          </section>

          <section className="rounded-2xl border bg-card text-card-foreground p-4 md:p-5 space-y-4">
            <h2 className="text-lg font-medium">Resultados</h2>
            <div className="text-sm text-muted-foreground">
              {rows ? (
                <>
                  <p>
                    Base: {formatCurrency(parsed.principal)} • CDI: {formatPct(parsed.cdiAnnual)} • % do CDI: {formatPct(parsed.pctCdi)}
                  </p>
                  {dailyRate !== null && (
                    <p>Taxa diária ({mode === 'all' ? '365' : '252'}): {formatPct(dailyRate * 100)}</p>
                  )}
                </>
              ) : (
                <p>Informe os parâmetros e clique em Calcular.</p>
              )}
            </div>

            {rows && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Principal</div>
                  <div className="font-medium">{formatCurrency(parsed.principal)}</div>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <div className="text-xs text-muted-foreground">CDI anual</div>
                  <div className="font-medium">{formatPct(parsed.cdiAnnual)}</div>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <div className="text-xs text-muted-foreground">% do CDI</div>
                  <div className="font-medium">{formatPct(parsed.pctCdi)}</div>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Taxa diária</div>
                  <div className="font-medium">{dailyRate !== null ? formatPct(dailyRate * 100) : '-'}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {rows && (
                <>
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent" onClick={onCopyCsv}>
                    <Copy className="size-4" /> Copiar CSV
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent" onClick={onDownloadCsv}>
                    <Download className="size-4" /> Exportar CSV
                  </button>
                </>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b bg-muted/50">
                    <th className="py-2 px-3">Período</th>
                    <th className="py-2 px-3">Até</th>
                    <th className="py-2 px-3">Rendimento</th>
                    <th className="py-2 px-3">Saldo final</th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.map((r) => (
                    <tr key={r.key} className="border-b last:border-0 hover:bg-accent/40">
                      <td className="py-2 px-3">{r.label}</td>
                      <td className="py-2 px-3">{r.until}</td>
                      <td className="py-2 px-3">{formatCurrency(r.earnings)}</td>
                      <td className="py-2 px-3 font-medium">{formatCurrency(r.finalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="text-xs text-muted-foreground">
          Cálculo com capitalização diária; em dias úteis, a taxa diária deriva de 252 dias/ano e aplica-se apenas em dias úteis (sem feriados nacionais).
        </footer>
      </div>
    </div>
  )
}

export default App

function parsePtBRNumber(value: string): number {
  if (!value) return NaN
  // Remove thousand separators and replace decimal comma
  const normalized = value.replace(/\./g, '').replace(/,/g, '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : NaN
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function formatPct(n: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(n) + '%'
}

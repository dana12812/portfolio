import { useMemo, useState } from 'react'
import { me } from '../data.js'

function today(tz) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date()).split('-').map(Number)
  return { y, m: m - 1, d }
}

function Calendar() {
  const t = useMemo(() => today(me.timeZone), [])
  const [view, setView] = useState({ y: t.y, m: t.m })
  const first = new Date(view.y, view.m, 1)
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const lead = (first.getDay() + 1) % 7
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const month = first.toLocaleString('en-GB', { month: 'long' })
  const shift = (n) => setView((v) => {
    const d = new Date(v.y, v.m + n, 1)
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  return (
    <div className="cal">
      <div className="cal-head">
        <button onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <div className="cal-title">
          <strong>{month}</strong> <span>{view.y}</span>
          {(view.m !== t.m || view.y !== t.y) && (
            <button className="cal-today" onClick={() => setView({ y: t.y, m: t.m })}>Today</button>
          )}
        </div>
        <button onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid">
        {['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'].map((d) => <span key={d} className="dow">{d}</span>)}
        {cells.map((n, i) => {
          const isToday = n === t.d && view.m === t.m && view.y === t.y
          const wknd = i % 7 === 6 || i % 7 === 0
          return <span key={i} className={`day ${isToday ? 'today' : ''} ${wknd ? 'wknd' : ''}`}>{n}</span>
        })}
      </div>
      <div className="cal-foot"><span className="dot" /> {me.calNote}</div>
    </div>
  )
}

const OPS = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
}
const fmt = (n) => {
  if (!Number.isFinite(n)) return 'Error'
  const s = String(parseFloat(n.toPrecision(10)))
  return s.length > 10 ? n.toExponential(4) : s
}

function Calculator() {
  const [disp, setDisp] = useState('0')
  const [acc, setAcc] = useState(null)
  const [op, setOp] = useState(null)
  const [fresh, setFresh] = useState(true)

  const press = (k) => {
    if (/^[0-9]$/.test(k)) { setDisp((d) => (fresh || d === '0' ? k : d.length < 10 ? d + k : d)); setFresh(false) }
    else if (k === '.') { setDisp((d) => (fresh ? '0.' : d.includes('.') ? d : d + '.')); setFresh(false) }
    else if (k === 'AC') { setDisp('0'); setAcc(null); setOp(null); setFresh(true) }
    else if (k === '±') setDisp((d) => (d === '0' ? d : d.startsWith('-') ? d.slice(1) : '-' + d))
    else if (k === '%') setDisp((d) => fmt(parseFloat(d) / 100))
    else if (k in OPS) {
      const v = parseFloat(disp)
      if (acc !== null && op && !fresh) { const r = OPS[op](acc, v); setAcc(r); setDisp(fmt(r)) } else setAcc(v)
      setOp(k); setFresh(true)
    } else if (k === '=') {
      if (acc === null || !op) return
      setDisp(fmt(OPS[op](acc, parseFloat(disp)))); setAcc(null); setOp(null); setFresh(true)
    }
  }
  const keys = ['AC', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '=']
  return (
    <div className="calc">
      <div className="lcd"><span className="lcd-op">{op || ''}</span><span className="lcd-num">{disp}</span></div>
      <div className="solar" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="keys">
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)}
            className={`key ${k in OPS || k === '=' ? 'op' : ''} ${['AC', '±', '%'].includes(k) ? 'fn' : ''} ${k === '0' ? 'zero' : ''} ${op === k && fresh ? 'lit' : ''}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Desk() {
  return (
    <div className="gadget">
      <div className="gadget-label"><span>DESK ORGANIZER</span><span>MODEL DA-26</span></div>
      <div className="gadget-body">
        <Calendar />
        <div className="hinge" aria-hidden="true" />
        <Calculator />
      </div>
    </div>
  )
}

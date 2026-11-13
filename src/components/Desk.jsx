import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { me } from '../data.js'

const W = 560
const H = 690

const LINES = [
  ['you need a', 'security engineer'],
  ['threats found:', '0'],
  ['bugs squashed:', 'all of them'],
  ['phishing links:', 'reported'],
  ['coffee level:', 'critical'],
  ['uptime:', '100%'],
  ['hire dana?', 'yes'],
]

function todayParts() {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: me.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date()).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function useTyped(text, run) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    setN(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= text.length) clearInterval(id)
    }, 55)
    return () => clearInterval(id)
  }, [text, run])
  return text.slice(0, n)
}

const Star = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 0c.6 5.8 4.2 9.4 10 10-5.8.6-9.4 4.2-10 10-.6-5.8-4.2-9.4-10-10C5.8 9.4 9.4 5.8 10 0z" fill="currentColor" />
  </svg>
)

export default function Desk() {
  const wrap = useRef(null)
  const [scale, setScale] = useState(1)
  const [seen, setSeen] = useState(false)
  const [line, setLine] = useState(0)
  const [pressed, setPressed] = useState(null)

  useLayoutEffect(() => {
    const el = wrap.current
    const fit = () => setScale(Math.min(1, el.clientWidth / W))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.4 })
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  const [l1, l2] = LINES[line]
  const full = `${l1}\n${l2}`
  const typed = useTyped(full, seen)
  const [t1, t2 = ''] = typed.split('\n')

  const press = (k) => {
    setPressed(k)
    setTimeout(() => setPressed(null), 140)
    setLine((i) => (k === 'C' ? 0 : (i + 1) % LINES.length))
  }

  // a 3 x 4 slice of the calendar around today
  const today = todayParts()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)
  const cells = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const month = today.toLocaleString('en-GB', { month: 'long' })

  const keys = ['C', '%', '÷', '×', '7', '8', '9', '−', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.']

  return (
    <div className="dscene-wrap" ref={wrap} style={{ height: H * scale }}>
      <div className={`dscene ${seen ? 'seen' : ''}`} style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <div className="dscene-title">
          <span>According to my</span>
          <em>calculations</em>
        </div>

        <div className="dcal" aria-label={`Calendar, today is ${today.getDate()} ${month}`}>
          <div className="dcal-month">{month} <span>{today.getFullYear()}</span></div>
          <div className="dcal-grid">
            {cells.map((d, i) => {
              const isToday = i === 6
              return (
                <div key={i} className={`dcell ${isToday ? 'hot' : ''}`}>
                  <span className="dnum">{d.getDate()}</span>
                  {isToday && (
                    <span className="save">
                      <Star className="s1" />
                      save the
                      <br />
                      date
                      <Star className="s2" />
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="dcalc">
          <div className="dcalc-screen" aria-live="polite">
            <span>{t1}</span>
            <span>{t2}<i className="caret" /></span>
          </div>
          <div className="dcalc-brand"><span>DANA · SEC-26</span><span className="solar"><i /><i /><i /><i /></span></div>
          <div className="dkeys">
            {keys.map((k) => (
              <button key={k} className={`dkey ${'÷×−+=%C'.includes(k) ? 'op' : ''} ${k === '=' ? 'eq' : ''} ${k === '0' ? 'zero' : ''} ${pressed === k ? 'down' : ''}`} onClick={() => press(k)} aria-label={k === 'C' ? 'Clear' : `Key ${k}`}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <p className="dhint">tap any key</p>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { me } from '../data.js'

/* Stage layouts, in stage units. Everything is scaled to fit the screen. */
const LAYOUTS = {
  wide: { W: 1060, H: 560, book: [20, 100], scanner: [640, 30] },
  tall: { W: 560, H: 1000, book: [20, 30], scanner: [90, 470] },
}
const PAGE_W = 260
const PAGE_H = 360
const GLASS = [40, 30, 300, 380] // x, y, w, h inside the scanner

const today = () =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bahrain' })
    .format(new Date())
    .toUpperCase()

function Emblem() {
  return (
    <svg className="emblem" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e2a6" />
          <stop offset=".45" stopColor="#c9a24a" />
          <stop offset=".7" stopColor="#8f6a22" />
          <stop offset="1" stopColor="#e8c977" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="url(#gold)" strokeWidth="2" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gold)" strokeWidth=".8" strokeDasharray="1.5 3" />
      {/* scallop shell */}
      <path d="M60 92 L27 62 Q28 40 44 33 Q52 29 60 29 Q68 29 76 33 Q92 40 93 62 Z" fill="url(#gold)" />
      <path d="M27 62 Q28 40 44 33 Q52 29 60 29 Q68 29 76 33 Q92 40 93 62" fill="none" stroke="#5a0f1c" strokeOpacity=".35" strokeWidth="1" />
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M60 90 L${60 + i * 7.6} ${33 + Math.abs(i) * Math.abs(i) * 0.9}`} stroke="#5a0f1c" strokeOpacity=".4" strokeWidth="1.1" />
      ))}
      <path d="M50 88 h20 l-3 8 h-14 z" fill="url(#gold)" />
      {/* the pearl */}
      <circle cx="60" cy="96" r="8.5" fill="#fbf4e2" stroke="url(#gold)" strokeWidth="1.2" />
      <circle cx="57.5" cy="93.5" r="2.6" fill="#fff" />
      {/* five-point serration, from the flag */}
      <path d="M38 14 h44 l-4.4 6 l-4.4 -6 l-4.4 6 l-4.4 -6 l-4.4 6 l-4.4 -6 l-4.4 6 l-4.4 -6 l-4.4 6 z" fill="url(#gold)" />
    </svg>
  )
}

function Serration({ className }) {
  return (
    <svg className={className} viewBox="0 0 22 360" preserveAspectRatio="none" aria-hidden="true">
      <rect width="22" height="360" fill="#7b1e2c" />
      <path d="M0 0 H8 L20 36 L8 72 L20 108 L8 144 L20 180 L8 216 L20 252 L8 288 L20 324 L8 360 H0 Z" fill="#fbf7ee" />
    </svg>
  )
}

export default function Gate({ onDone }) {
  const [phase, setPhase] = useState('closed') // closed | open | scanning | verified | leaving
  const [layout, setLayout] = useState('wide')
  const [scale, setScale] = useState(1)
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [stamped, setStamped] = useState(false)
  const timers = useRef([])
  const start = useRef(null)
  const date = useRef(today())
  const L = LAYOUTS[layout]
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useLayoutEffect(() => {
    const fit = () => {
      const lay = window.innerWidth < 760 ? 'tall' : 'wide'
      const { W, H } = LAYOUTS[lay]
      setLayout(lay)
      setScale(Math.min(1, (window.innerWidth * 0.94) / W, (window.innerHeight - 200) / H))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('gate-lock')
    return () => {
      document.documentElement.classList.remove('gate-lock')
      timers.current.forEach(clearTimeout)
    }
  }, [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  // where the book must sit so the photo page lands on the scanner glass
  const target = useCallback(() => {
    const [bx, by] = L.book
    const [sx, sy] = L.scanner
    const photoCx = bx + PAGE_W + PAGE_W / 2
    const photoCy = by + PAGE_H / 2
    const glassCx = sx + GLASS[0] + GLASS[2] / 2
    const glassCy = sy + GLASS[1] + GLASS[3] / 2
    return { x: glassCx - photoCx, y: glassCy - photoCy }
  }, [L])

  const leave = useCallback(() => {
    setPhase('leaving')
    later(onDone, reduce ? 50 : 900)
  }, [onDone, reduce])

  const scan = useCallback(() => {
    setDrag({ ...target(), active: false })
    setPhase('scanning')
    later(() => {
      setPhase('verified')
      later(() => setStamped(true), 250)
      later(leave, 2600)
    }, reduce ? 300 : 2000)
  }, [target, leave, reduce])

  const open = () => phase === 'closed' && setPhase('open')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') leave()
      if (e.key !== 'Enter') return
      if (phase === 'closed') setPhase('open')
      else if (phase === 'open') scan()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, scan, leave])

  const down = (e) => {
    if (phase !== 'open') return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX, py: e.clientY, x: drag.x, y: drag.y }
    setDrag((d) => ({ ...d, active: true }))
  }
  const move = (e) => {
    if (!start.current) return
    const s = start.current
    setDrag({ x: s.x + (e.clientX - s.px) / scale, y: s.y + (e.clientY - s.py) / scale, active: true })
  }
  const up = () => {
    if (!start.current) return
    start.current = null
    const [bx, by] = L.book
    const [sx, sy] = L.scanner
    const px = bx + PAGE_W + drag.x
    const py = by + drag.y
    const gx = sx + GLASS[0]
    const gy = sy + GLASS[1]
    const ox = Math.max(0, Math.min(px + PAGE_W, gx + GLASS[2]) - Math.max(px, gx))
    const oy = Math.max(0, Math.min(py + PAGE_H, gy + GLASS[3]) - Math.max(py, gy))
    if ((ox * oy) / (PAGE_W * PAGE_H) > 0.3) scan()
    else setDrag({ x: 0, y: 0, active: false })
  }

  const closedShift = phase === 'closed' ? -PAGE_W / 2 : 0
  const lcd = { closed: 'READY', open: 'READY', scanning: 'SCANNING', verified: 'VERIFIED', leaving: 'VERIFIED' }[phase]
  const msg = {
    closed: ['Open your passport', layout === 'tall' ? 'Tap the cover' : 'Tap the cover · or press Enter'],
    open: ['Place the photo page on the scanner', layout === 'tall' ? 'Drag the passport onto the glass' : 'Drag the passport onto the glass · or press Enter'],
    scanning: ['Scanning photo page…', 'Please hold still'],
    verified: ['Admitted. Welcome in.', 'أهلاً وسهلاً'],
    leaving: ['Admitted. Welcome in.', 'أهلاً وسهلاً'],
  }[phase]

  return (
    <div className={`gate ${phase}`} role="dialog" aria-modal="true" aria-label="Passport entry">
      <div className="gate-top">
        <span className="logo">{me.first.toLowerCase()}<span>.</span></span>
        <span className="gate-tag">Gate 01 · Manama · بوابة</span>
        <button className="gate-skip" onClick={leave}>Skip</button>
      </div>

      <div className="gate-stage-wrap" style={{ width: L.W * scale, height: L.H * scale }}>
        <div className="gate-stage" style={{ width: L.W, height: L.H, transform: `scale(${scale})` }}>
          {/* scanner */}
          <div className={`scanner ${phase}`} style={{ left: L.scanner[0], top: L.scanner[1] }}>
            <div className="scanner-label"><span>PASSPORT SCANNER</span><span>مسح</span></div>
            <div className="glass" style={{ left: GLASS[0], top: GLASS[1], width: GLASS[2], height: GLASS[3] }}>
              <div className="glass-grid" />
              <div className="scan-beam" />
            </div>
            <div className="lcd-row">
              <span className="led" />
              <span className="scanner-lcd">{lcd}</span>
            </div>
          </div>

          <div
            className={`beam-over ${phase}`}
            style={{ left: L.scanner[0] + GLASS[0], top: L.scanner[1] + GLASS[1], width: GLASS[2], height: GLASS[3] }}
            aria-hidden="true"
          >
            <div className="scan-beam" />
          </div>

          {/* passport */}
          <div
            className={`book ${phase} ${drag.active ? 'dragging' : ''}`}
            style={{
              left: L.book[0],
              top: L.book[1],
              transform: `translate(${drag.x + closedShift}px, ${drag.y}px)`,
            }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          >
            {/* photo page (right) */}
            <div className="ppage photo">
              <Serration className="serr" />
              <div className="ppage-head"><span>PORTFOLIO PASSPORT</span><span className="ar">جواز سفر</span></div>
              <div className="pp-body">
                <div className="pp-photo"><span>{me.initials}</span></div>
                <div className="pp-fields">
                  <div><small>Surname / اللقب</small>AL SALEH</div>
                  <div><small>Given name / الاسم</small>DANA</div>
                  <div><small>Nationality / الجنسية</small>BAHRAINI</div>
                  <div><small>Place of issue</small>MANAMA</div>
                </div>
              </div>
              <div className="pp-wide">
                <div><small>Profession / المهنة</small>Software Engineer · Cyber Threat Analyst</div>
                <div className="pp-two">
                  <div><small>Date of issue</small>{date.current}</div>
                  <div><small>No.</small>DA-{me.idNumber}</div>
                </div>
              </div>
              <div className="pp-sign">Dana</div>
              <div className="mrz">
                <span>PORTFOLIO&lt;&lt;AL&lt;SALEH&lt;&lt;DANA&lt;&lt;&lt;&lt;&lt;&lt;</span>
                <span>SOFTWARE&lt;ENGINEER&lt;&lt;CYBER&lt;ANALYST&lt;&lt;</span>
              </div>
              <div className={`arrival ${stamped ? 'in' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 160 160">
                  <defs>
                    <path id="arcT" d="M17 80 a63 63 0 0 1 126 0" />
                    <path id="arcB" d="M14 80 a66 66 0 0 0 132 0" />
                  </defs>
                  <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="80" cy="80" r="54" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <text fontSize="11.5" letterSpacing="1.6" fontWeight="600"><textPath href="#arcT" startOffset="50%" textAnchor="middle">ADMITTED · MANAMA</textPath></text>
                  <text fontSize="11" letterSpacing="2.5"><textPath href="#arcB" startOffset="50%" textAnchor="middle">{date.current}</textPath></text>
                  <text x="80" y="91" textAnchor="middle" className="ar" fontSize="25">أهلاً وسهلاً</text>
                </svg>
              </div>
            </div>

            {/* cover: front is the passport cover, back is the visa page */}
            <div className={`cover ${phase === 'closed' ? '' : 'flipped'}`} onClick={open}>
              <div className="cover-front">
                <span className="ar cover-ar">جواز سفر</span>
                <Emblem />
                <span className="cover-title">PASSPORT</span>
                <span className="cover-sub">{me.name.toUpperCase()} · PORTFOLIO</span>
              </div>
              <div className="cover-back ppage visas">
                <div className="ppage-head"><span>VISAS</span><span className="ar">تأشيرات</span></div>
                <div className="vstamp v1"><b>CTM360</b><span>OSINT · 2025</span></div>
                <div className="vstamp v2 round"><b>GA</b><span>Bootcamp · 2026</span></div>
                <div className="vstamp v3"><b>POLYTECHNIC</b><span>B.Tech · 2027</span></div>
                <div className="vstamp v4 round"><b>NSE</b><span>Fortinet 1–3</span></div>
                <span className="page-no">02</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gate-msg" aria-live="polite">
        <p className="gate-title">{msg[0]}</p>
        <p className={`gate-hint ${phase === 'verified' || phase === 'leaving' ? 'ar' : ''}`}>{msg[1]}</p>
        {phase === 'open' && <button className="btn sm" onClick={scan}>Scan it for me</button>}
      </div>
    </div>
  )
}

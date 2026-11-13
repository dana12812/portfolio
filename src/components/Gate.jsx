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
  // original engraved-style emblem: a pearl in a scallop shell under a date palm, framed by scrolls
  const g = '#e3b84c'
  const scroll = 'M0 0 C-14 -6 -26 -2 -30 10 C-33 20 -26 30 -16 28 C-8 26 -8 16 -15 15 C-20 14 -22 20 -18 22'
  return (
    <svg className="emblem" viewBox="0 0 200 200" fill="none" stroke={g} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* date palm */}
      <path d="M100 74 C99 62 100 50 101 40" strokeWidth="3" />
      <path d="M101 40 C92 30 80 30 72 36 M101 40 C110 30 122 30 130 36 M101 40 C94 24 84 18 76 18 M101 40 C108 24 118 18 126 18 M101 40 C100 28 101 18 103 10" strokeWidth="2.4" />
      <path d="M96 44 l-4 3 M106 44 l4 3" strokeWidth="2" />
      {/* scallop shell */}
      <path d="M100 150 L58 104 C58 84 76 72 100 72 C124 72 142 84 142 104 Z" strokeWidth="3" />
      <path d="M100 148 L64 104 M100 148 L74 92 M100 148 L87 80 M100 148 L100 76 M100 148 L113 80 M100 148 L126 92 M100 148 L136 104" strokeWidth="1.6" />
      <path d="M88 150 h24 l-4 10 h-16 z" strokeWidth="2.4" />
      {/* the pearl */}
      <circle cx="100" cy="170" r="11" strokeWidth="2.6" />
      <path d="M95 165 a6 6 0 0 1 6 -3" strokeWidth="1.8" />
      {/* scroll work, both sides */}
      <g strokeWidth="2.2">
        <path transform="translate(58 110)" d={scroll} />
        <path transform="translate(142 110) scale(-1 1)" d={scroll} />
        <path transform="translate(62 140) rotate(-20)" d={scroll} />
        <path transform="translate(138 140) rotate(20) scale(-1 1)" d={scroll} />
      </g>
      <path d="M40 92 C30 110 32 140 52 158 M160 92 C170 110 168 140 148 158" strokeWidth="1.6" strokeDasharray="1 5" />
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

  const gone = useRef(false)
  const leave = useCallback(() => {
    if (gone.current) return
    gone.current = true
    setPhase('leaving')
    later(onDone, reduce ? 50 : 900)
  }, [onDone, reduce])

  const play = useCallback(() => {
    const T = reduce ? [100, 200, 300, 400, 900] : [900, 2300, 3300, 5200, 7000]
    later(() => setPhase('open'), T[0])
    later(() => setDrag({ ...target(), active: false }), T[1])
    later(() => setPhase('scanning'), T[2])
    later(() => { setPhase('verified'); later(() => setStamped(true), 250) }, T[3])
    later(leave, T[4])
  }, [target, leave, reduce])

  useEffect(() => {
    play()
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [play])

  useEffect(() => {
    const onKey = (e) => (e.key === 'Escape' || e.key === 'Enter') && leave()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leave])

  const closedShift = phase === 'closed' ? -PAGE_W / 2 : 0
  const lcd = { closed: 'READY', open: 'READY', scanning: 'SCANNING', verified: 'VERIFIED', leaving: 'VERIFIED' }[phase]
  const msg = {
    closed: ['Arriving in Bahrain', 'Gate 01 · Manama'],
    open: ['Presenting passport', 'Photo page to the scanner'],
    scanning: ['Scanning photo page…', 'Please hold still'],
    verified: ['Admitted. Welcome in.', 'أهلاً وسهلاً'],
    leaving: ['Admitted. Welcome in.', 'أهلاً وسهلاً'],
  }[phase]

  return (
    <div className={`gate ${phase}`} role="dialog" aria-modal="true" aria-label="Passport entry">
      <div className="gate-top">
        <span className="logo">{me.first.toLowerCase()}<span>.</span></span>
        <span className="gate-tag">Gate 01 · Manama · بوابة</span>
        <button className="gate-skip" onClick={leave}>Skip intro</button>
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
            <div className={`cover ${phase === 'closed' ? '' : 'flipped'}`}>
              <div className="cover-front">
                <span className="ar cover-ar">دانة الصالح</span>
                <span className="cover-name">DANA AL SALEH</span>
                <Emblem />
                <span className="ar cover-ar2">جواز سفر</span>
                <span className="cover-title">PASSPORT</span>
                <svg className="chip" viewBox="0 0 40 26" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="37" height="23" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="M1.5 9h12M26.5 9h12M1.5 17h12M26.5 17h12" stroke="currentColor" strokeWidth="2.4" />
                  <circle cx="20" cy="13" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
                </svg>
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

      <div className={`gate-progress ${reduce ? 'fast' : ''}`} aria-hidden="true"><i /></div>
      <div className="gate-msg" aria-live="polite">
        <p className="gate-title">{msg[0]}</p>
        <p className={`gate-hint ${phase === 'verified' || phase === 'leaving' ? 'ar' : ''}`}>{msg[1]}</p>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { me } from '../data.js'

export default function Badge() {
  const swing = useRef(null)
  const s = useRef({ angle: 0, vel: 0, dragging: false, startX: 0, startAngle: 0, t: 0 })

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf
    const tick = () => {
      const st = s.current
      st.t += 1
      if (!st.dragging) {
        const rest = reduce ? 0 : Math.sin(st.t / 70) * 1.2
        st.vel = (st.vel - 0.035 * (st.angle - rest)) * 0.965
        st.angle += st.vel
      }
      if (swing.current) swing.current.style.transform = `rotate(${st.angle}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const down = (e) => {
    const st = s.current
    st.dragging = true
    st.startX = e.clientX
    st.startAngle = st.angle
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    const st = s.current
    if (!st.dragging) return
    const a = Math.max(-35, Math.min(35, st.startAngle - (e.clientX - st.startX) * 0.25))
    st.vel = a - st.angle
    st.angle = a
  }
  const up = () => { s.current.dragging = false }

  return (
    <div className="badge-rig" aria-label="ID badge, drag to swing">
      <div className="badge-swing" ref={swing}>
        <svg className="lanyard" viewBox="0 0 60 260" preserveAspectRatio="none" aria-hidden="true">
          <path d="M8 0 L26 250 M52 0 L34 250" stroke="var(--accent)" strokeWidth="9" fill="none" />
          <path d="M8 0 L26 250 M52 0 L34 250" stroke="#fff" strokeOpacity=".18" strokeWidth="9" strokeDasharray="2 8" fill="none" />
        </svg>
        <div className="clip" aria-hidden="true"><span /></div>
        <div className="badge" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div className="badge-hole" />
          <div className="badge-top"><span>SECURITY PASS</span><span>№ {me.idNumber}</span></div>
          <div className="badge-photo"><span>{me.initials}</span></div>
          <div className="badge-name">{me.name}</div>
          <div className="badge-role">Software Engineer · Cyber Threat Analyst</div>
          <div className="badge-meta">
            <div><small>School</small>{me.school}</div>
            <div><small>Based</small>Bahrain</div>
          </div>
          <div className="barcode" aria-hidden="true">
            {Array.from({ length: 34 }, (_, i) => <i key={i} style={{ width: [1, 2, 1, 3, 1, 2][(i * 7) % 6] }} />)}
          </div>
          <div className="badge-hint">drag me</div>
        </div>
      </div>
    </div>
  )
}

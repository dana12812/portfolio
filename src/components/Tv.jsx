import { useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../data.js'
import { Arrow } from './Icons.jsx'

const src = (p) => `./${p}`

function Static({ active }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!active) return
    const c = ref.current, ctx = c.getContext('2d')
    const w = (c.width = 160), h = (c.height = 120)
    const img = ctx.createImageData(w, h)
    let raf
    const draw = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [active])
  return <canvas ref={ref} className={`static ${active ? 'on' : ''}`} aria-hidden="true" />
}

export default function Tv({ channel, setChannel }) {
  const [switching, setSwitching] = useState(false)
  const [power, setPower] = useState(true)
  const touchX = useRef(null)
  const p = projects[channel]

  const go = useCallback((n) => {
    const next = (n + projects.length) % projects.length
    setSwitching(true)
    setTimeout(() => {
      setChannel(next)
      setTimeout(() => setSwitching(false), 220)
    }, 180)
  }, [setChannel])

  useEffect(() => {
    const onKey = (e) => {
      if (!document.activeElement?.closest?.('.tv')) return
      if (e.key === 'ArrowRight') go(channel + 1)
      if (e.key === 'ArrowLeft') go(channel - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [channel, go])

  return (
    <div className="tv-wrap">
      <div className="antenna" aria-hidden="true"><i /><i /><b /></div>
      <div className="tv" tabIndex={0} aria-label="Project TV. Use the arrow keys to change channel">
        <div
          className="screen-bezel"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 40) go(channel + (dx < 0 ? 1 : -1))
            touchX.current = null
          }}
        >
          <div className={`screen ${power ? '' : 'off'}`}>
            {projects.map((x, i) => (
              <img key={x.image} src={src(x.image)} alt={x.title} className={i === channel ? 'show' : ''} draggable="false" />
            ))}
            <Static active={switching && power} />
            <div className="scan" aria-hidden="true" />
            <div className="osd" aria-hidden="true">
              <span>CH {String(channel + 1).padStart(2, '0')}</span>
              <span className="rec"><i className="rec-dot" /> LIVE</span>
            </div>
            <div className="screen-glare" aria-hidden="true" />
          </div>
        </div>
        <div className="tv-panel">
          <div className="brand">DANA<span>VISION</span></div>
          <div className="speaker" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</div>
          <div className="controls">
            <button className="knob" onClick={() => go(channel - 1)} aria-label="Previous project"><span>‹</span></button>
            <button className="knob" onClick={() => go(channel + 1)} aria-label="Next project"><span>›</span></button>
            <button className={`power ${power ? 'on' : ''}`} onClick={() => setPower((v) => !v)} aria-label="Power" />
          </div>
        </div>
      </div>
      <div className="tv-feet" aria-hidden="true"><i /><i /></div>
      <div className="tv-caption">
        <div>
          <span className="cap-type">{p.type} · {p.year}</span>
          <h3>{p.title}</h3>
          <span className="cap-stack">{p.stack}</span>
          <p>{p.note}</p>
          <div className="cap-links">
            {p.links.map((l, i) => (
              <a key={l.label} className={`btn sm ${i === 0 ? 'primary' : ''}`} href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label} <Arrow />
              </a>
            ))}
          </div>
        </div>
        <div className="dots">
          {projects.map((x, i) => (
            <button key={x.title} className={i === channel ? 'active' : ''} onClick={() => go(i)} aria-label={`Show ${x.title}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

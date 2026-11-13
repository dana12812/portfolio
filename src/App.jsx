import { useEffect, useRef, useState } from 'react'
import { me, links, skills, projects, facts, journey, certs, verifyUrl } from './data.js'
import Badge from './components/Badge.jsx'
import Tv from './components/Tv.jsx'
import Desk from './components/Desk.jsx'
import { Arrow, Spark } from './components/Icons.jsx'
import TabBar from './components/TabBar.jsx'
import Gate from './components/Gate.jsx'

const src = (p) => `./${p}`

function useClock(tz) {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000)
    return () => clearInterval(id)
  }, [])
  return t
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => (e.dataset.in = '1')); return }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.dataset.in = '1'; io.unobserve(e.target) }
    }), { threshold: 0.12 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

const NAV = [
  ['#work', 'Work'],
  ['#desk', 'About'],
  ['#journey', 'Journey'],
  ['#certs', 'Certificates'],
  ['#contact', 'Contact'],
]

export default function App() {
  const time = useClock(me.timeZone)
  const [channel, setChannel] = useState(0)
  const [copied, setCopied] = useState(false)
  const [menu, setMenu] = useState(false)
  const [zoom, setZoom] = useState(null)
  const tvRef = useRef(null)
  const [gate, setGate] = useState(() => {
    try { return sessionStorage.getItem('dana-gate') !== 'passed' } catch { return true }
  })
  const passGate = () => {
    try { sessionStorage.setItem('dana-gate', 'passed') } catch { /* private mode */ }
    setGate(false)
    window.scrollTo(0, 0)
  }
  useReveal()

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => e.key === 'Escape' && setZoom(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  const pick = (i) => {
    setChannel(i)
    tvRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(me.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }

  return (
    <>
      <nav className="nav">
        <a href="#top" className="logo">{me.first.toLowerCase()}<span>.</span></a>
        <div className={`nav-links ${menu ? 'open' : ''}`}>
          {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setMenu(false)}>{l}</a>)}
        </div>
        <div className="nav-right">
          <span className="nav-time">{time} BH</span>
          <button className={`menu-btn ${menu ? 'x' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
            <i /><i />
          </button>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-text">
          <p className="eyebrow reveal"><Spark className="eyebrow-spark" /> Software engineer · Cyber threat analyst</p>
          <h1 className="reveal">Hi, I’m {me.first}.<br /><em>I build software</em><br />that holds up.</h1>
          <p className="lead reveal">{me.intro}</p>
          <div className="hero-cta reveal">
            <a className="btn primary" href="#work">See my work</a>
            {links.slice(0, 2).map((l) => (
              <a key={l.label} className="btn" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} <Arrow /></a>
            ))}
          </div>
        </div>
        <Badge />
      </header>

      <div className="marquee" aria-label="Skills">
        <div className="track">
          {[...skills, ...skills].map((s, i) => <span key={i}>{s}<Spark /></span>)}
        </div>
      </div>

      <section className="section" id="work">
        <div className="section-head reveal">
          <span className="num">01</span>
          <h2>Now showing<em>.</em></h2>
          <p>Turn the knobs, swipe the screen, or pick a project below.</p>
        </div>
        <div className="tv-stage reveal" ref={tvRef}>
          <Tv channel={channel} setChannel={setChannel} />
        </div>
        <div className="grid">
          {projects.map((p, i) => (
            <button key={p.title} className={`tile reveal ${i === channel ? 'on-air' : ''}`} onClick={() => pick(i)}>
              <div className="tile-img">
                <img src={src(p.image)} alt={p.title} loading="lazy" />
                <span className="tile-ch">CH {String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="tile-meta"><span>{p.title}</span><span>{p.type}</span></div>
            </button>
          ))}
        </div>
      </section>

      <section className="section desk" id="desk">
        <div className="section-head reveal">
          <span className="num">02</span>
          <h2>On my desk<em>.</em></h2>
        </div>
        <div className="desk-grid">
          <div className="about reveal">
            <p className="about-big">{me.about}</p>
            <ul className="facts">
              {facts.map((f) => <li key={f.k}><small>{f.k}</small>{f.v}</li>)}
            </ul>
            <div className="about-cta">
              <a className="btn primary" href={links[0].href} target="_blank" rel="noopener noreferrer">GitHub <Arrow /></a>
              <a className="btn primary" href={links[1].href} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow /></a>
              <a className="btn" href={`mailto:${me.email}`} target="_blank" rel="noopener noreferrer">Email me <Arrow /></a>
            </div>
          </div>
          <div className="reveal"><Desk /></div>
        </div>
      </section>

      <section className="section" id="journey">
        <div className="section-head reveal">
          <span className="num">03</span>
          <h2>The journey<em>.</em></h2>
          <p>Where I’ve worked and what I’ve studied so far.</p>
        </div>
        <ol className="timeline">
          {journey.map((j) => (
            <li key={j.role} className="trow reveal">
              <span className="twhen">{j.when}</span>
              <div className="tbody">
                <h3>{j.role}</h3>
                <span className="torg">{j.org} · {j.place}</span>
                <p>{j.note}</p>
              </div>
              <img className="tlogo" src={src(j.logo)} alt={`${j.org} logo`} loading="lazy" />
            </li>
          ))}
        </ol>
      </section>

      <section className="section" id="certs">
        <div className="section-head reveal">
          <span className="num">04</span>
          <h2>Certified<em>.</em></h2>
          <p>Fortinet Certified in Cybersecurity, all three levels.</p>
        </div>
        <div className="cert-head reveal">
          <img src={src('logos/fortinet.png')} alt="Fortinet logo" />
          <div>
            <span className="cap-type">Fortinet Training Institute</span>
            <strong>Network Security Expert 1–3</strong>
          </div>
          <a className="btn sm" href={verifyUrl} target="_blank" rel="noopener noreferrer">Verify <Arrow /></a>
        </div>
        <div className="certs">
          {certs.map((c) => (
            <figure key={c.level} className="cert reveal">
              <button className="cert-img" onClick={() => setZoom(c)} aria-label={`View ${c.level} certificate full size`}>
                <img src={src(c.image)} alt={`Fortinet ${c.level} certificate`} loading="lazy" />
              </button>
              <figcaption>
                <span className="cert-title">{c.title}</span>
                <span className="cert-meta"><small>Achieved</small>{c.achieved}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="reveal">
          <span className="num light">05</span>
          <h2>Let’s build<br /><em>something secure.</em></h2>
          <div className="mail-row">
            <a className="mail" href={`mailto:${me.email}`} target="_blank" rel="noopener noreferrer">{me.email}</a>
            <button className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
        <ul className="social reveal">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                <span>{l.label}</span>
                <span className="handle">{l.handle}</span>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
        <footer className="foot">
          <span>© {new Date().getFullYear()} {me.name}</span>
          <span>Designed &amp; built in Bahrain</span>
          <button className="foot-gate" onClick={() => setGate(true)}>Return to gate</button>
          <a href="#top">Back to top ↑</a>
        </footer>
      </section>

      <TabBar />

      {gate && <Gate onDone={passGate} />}

      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${zoom.level} certificate`} onClick={() => setZoom(null)}>
          <img src={src(zoom.image)} alt={`Fortinet ${zoom.level} certificate`} />
          <button className="copy lb-close" onClick={() => setZoom(null)}>Close</button>
        </div>
      )}
    </>
  )
}

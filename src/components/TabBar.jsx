import { useEffect, useState } from 'react'

const I = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  work: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="m9 2 3 3.5L15 2" /></>,
  about: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
  journey: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" /></>,
  certs: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 7 5-2.5 5 2.5-1.5-7" /></>,
  contact: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  code: <><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /><path d="m13.5 4-3 16" /></>,
  case: <><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M3 12.5h18" /></>,
}

const EXT = [
  ['https://github.com/dana12812', 'GitHub', 'code'],
  ['https://www.linkedin.com/in/danaalsaleh128', 'LinkedIn', 'case'],
]

const TABS = [
  ['top', 'Home', 'home'],
  ['work', 'Work', 'work'],
  ['desk', 'About', 'about'],
  ['journey', 'Journey', 'journey'],
  ['certs', 'Certs', 'certs'],
]
const SPY = [...TABS.map(([id]) => id), 'contact']

export default function TabBar() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const els = SPY.map((id) => document.getElementById(id)).filter(Boolean)
    const onScroll = () => {
      const line = window.innerHeight * 0.4
      let cur = 'top'
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = 'contact'
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map(([id, label, icon]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{I[icon]}</svg>
          <span>{label}</span>
        </a>
      ))}
      <i className="tab-sep" aria-hidden="true" />
      {EXT.map(([href, label, icon]) => (
        <a key={label} href={href} className="ext" target="_blank" rel="noopener noreferrer" aria-label={`${label} profile (opens in a new tab)`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{I[icon]}</svg>
          <span>{label}<svg className="ext-arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" /></svg></span>
        </a>
      ))}
    </nav>
  )
}

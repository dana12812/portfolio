export const me = {
  name: 'Dana Al Saleh',
  first: 'Dana',
  initials: 'DA',
  role: 'Software Engineer & Cyber Threat Analyst',
  school: 'Bahrain Polytechnic',
  location: 'Manama, Bahrain',
  timeZone: 'Asia/Bahrain',
  idNumber: '2026-0128',
  intro:
    'Software engineer and cyber threat analyst in Bahrain. I build full-stack apps, then try to break them the way an attacker would.',
  about:
    'I’m finishing a B.Tech in Cyber Security at Bahrain Polytechnic and recently completed General Assembly’s Software Engineering Bootcamp. Before that I investigated phishing campaigns at CTM360. I like building things, then working out how someone might break them.',
  calNote: 'B.Tech Cyber Security, class of 2027',
  email: 'd.alsaleh128@gmail.com',
}

export const links = [
  { label: 'GitHub', handle: 'dana12812', href: 'https://github.com/dana12812' },
  { label: 'LinkedIn', handle: 'danaalsaleh128', href: 'https://www.linkedin.com/in/danaalsaleh128' },
  { label: 'Fortinet', handle: 'verify certificates', href: 'https://training.fortinet.com/admin/tool/certificate/index.php' },
]

export const skills = [
  'JavaScript', 'Python', 'React', 'Node & Express', 'FastAPI', 'PostgreSQL',
  'MongoDB', 'OSINT', 'Threat intelligence', 'AWS security', 'Scapy', 'Digital forensics',
]

export const projects = [
  {
    title: 'PacketScope',
    type: 'Network analysis',
    year: '2026',
    stack: 'Solo · React · FastAPI · PostgreSQL · Scapy',
    image: 'work/packetscope.jpg',
    note: 'Turn packet captures into network intelligence. Upload a .pcap and see protocols, top talkers, services and packet sizes, with JWT roles, notes, tags and an admin activity log.',
    links: [
      { label: 'Live app', href: 'https://packetscope-psi.vercel.app' },
      { label: 'Front end', href: 'https://github.com/dana12812/packetscope-front-end' },
      { label: 'Back end', href: 'https://github.com/dana12812/packetscope-back-end' },
    ],
  },
  {
    title: 'CyberTrack',
    type: 'Incident tracking',
    year: '2026',
    stack: 'Team of 3 · MERN · JWT · I built Incidents',
    image: 'work/cybertrack.jpg',
    note: 'Incident tracking for security teams: report incidents, link threat indicators and assign investigations. Analysts create and update; only admins delete, so records stay a reliable audit trail.',
    links: [
      { label: 'Live app', href: 'https://cyber-tracking-frontend.vercel.app' },
      { label: 'Front end', href: 'https://github.com/IDAC1899/cyber-tracking-frontend' },
      { label: 'Back end', href: 'https://github.com/IDAC1899/cyber-tracking-backend' },
    ],
  },
  {
    title: 'Hawiyati',
    type: 'Digital identity',
    year: '2026',
    stack: 'Solo · Node · Express · MongoDB · OAuth',
    image: 'work/hawiyati.jpg',
    note: 'Shareable digital ID cards, each with its own QR code and short link, showing only the fields you choose. Hardened with CSRF tokens, rate limiting and secure headers.',
    links: [
      { label: 'Live app', href: 'https://hawiyati.onrender.com/' },
      { label: 'Code', href: 'https://github.com/dana12812/hawiyati-app' },
    ],
  },
  {
    title: 'Connect Four',
    type: 'Browser game',
    year: '2026',
    stack: 'Solo · HTML · CSS · JavaScript',
    image: 'work/connect4.jpg',
    note: 'My very first project: the classic game built from scratch, with a computer opponent, win highlighting, confetti, themes and a saved leaderboard.',
    links: [
      { label: 'Play it', href: 'https://dana12812.github.io/connect4-game/' },
      { label: 'Code', href: 'https://github.com/dana12812/connect4-game' },
    ],
  },
]

export const facts = [
  { k: 'Studying', v: 'B.Tech Cyber Security, 2027' },
  { k: 'Based in', v: 'Manama, Bahrain' },
  { k: 'Stack', v: 'React · Node · FastAPI · PostgreSQL · MongoDB' },
  { k: 'Security', v: 'OSINT · AWS IAM/VPC/KMS · Scapy · Autopsy · FTK' },
  { k: 'Tools', v: 'Git · VS Code · Figma · VirtualBox' },
  { k: 'Languages', v: 'Arabic (native) · English (fluent)' },
]

export const journey = [
  {
    when: 'Jun – Jul 2025',
    role: 'Junior Cyber Threat Analyst',
    org: 'CTM360',
    place: 'Bahrain',
    logo: 'logos/ctm360.png',
    note: 'OSINT investigations into phishing campaigns and suspicious domains. Analyzed IOCs, URLs and domains across 30+ cases and wrote concise threat reports.',
  },
  {
    when: 'Jul – Oct 2026',
    role: 'Software Engineering Bootcamp',
    org: 'General Assembly',
    place: 'Bahrain',
    logo: 'logos/ga.png',
    note: 'Full-stack JavaScript and Python. Shipped four deployed projects and 40+ labs.',
  },
  {
    when: 'Expected Jun 2027',
    role: 'B.Tech in Cyber Security',
    org: 'Bahrain Polytechnic',
    place: 'Bahrain',
    logo: 'logos/poly.png',
    note: '10+ AWS security labs, 5+ Python automation scripts, 8+ digital forensics cases.',
  },
]

export const certs = [
  {
    level: 'NSE 1',
    title: 'The threat landscape',
    image: 'certs/nse1.jpg',
    achieved: 'Oct 16, 2026',
  },
  {
    level: 'NSE 2',
    title: 'Security solutions',
    image: 'certs/nse2.jpg',
    achieved: 'Nov 10, 2026',
  },
  {
    level: 'NSE 3',
    title: 'Fortinet products',
    image: 'certs/nse3.jpg',
    achieved: 'Nov 10, 2026',
  },
]

export const verifyUrl = 'https://training.fortinet.com/admin/tool/certificate/index.php'

import base64,re,pathlib,math
t=pathlib.Path('template.html').read_text()
def img(m):
    n=m.group(1); mime='image/png' if n.endswith('.png') else 'image/jpeg'
    return f"data:{mime};base64,"+base64.b64encode(pathlib.Path('img/'+n).read_bytes()).decode()
t=re.sub(r'\{\{IMG:([^}]+)\}\}',img,t)
S='<svg viewBox="0 0 40 40"><path fill="currentColor" d="M20 0c1.2 11.5 8.5 18.8 20 20-11.5 1.2-18.8 8.5-20 20-1.2-11.5-8.5-18.8-20-20C11.5 18.8 18.8 11.5 20 0z"/></svg>'
ic=lambda d:f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
F='/tmp/fonts/node_modules/@fontsource/'
def ff(fam,file,w,st='normal'):
    d=base64.b64encode(pathlib.Path(F+file).read_bytes()).decode()
    return f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{d}) format('woff2')}}"
fonts=[ff('Yellowtail','yellowtail/files/yellowtail-latin-400-normal.woff2',400),
 ff('Instrument Serif','instrument-serif/files/instrument-serif-latin-400-normal.woff2',400),
 ff('Instrument Serif','instrument-serif/files/instrument-serif-latin-400-italic.woff2',400,'italic')]
fonts+=[ff('Inter',f'inter/files/inter-latin-{w}-normal.woff2',w) for w in (400,500,600,700)]
fonts+=[ff('Caveat',f'caveat/files/caveat-latin-{w}-normal.woff2',w) for w in (400,500)]
fonts+=[ff('IBM Plex Mono',f'ibm-plex-mono/files/ibm-plex-mono-latin-{w}-normal.woff2',w) for w in (400,500)]
t=t.replace('{{FONTS}}','\n'.join(fonts))
t=t.replace('{{SPARK}}',S)
t=t.replace('{{ICON_EXT}}',ic('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'))
t=t.replace('{{ICON_GH}}','<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>')
t=t.replace('{{ICON_MAIL}}',ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'))
t=t.replace('{{ICON_IN}}','<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.3 21 14.7V21h-4v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V21H9z"/></svg>')
C='<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 52V14C4 8 8 4 14 4h38"/><path d="M12 52V22c0-6 4-10 10-10h30"/><path d="M22 22c6 0 10 4 10 10-5 0-10-4-10-10z" fill="currentColor" fill-opacity=".15"/><circle cx="4" cy="4" r="2.5" fill="currentColor"/></svg>'
t=t.replace('{{CORNERS}}',''.join(f'<span class="corner {p}" aria-hidden="true">{C}</span>' for p in ('tl','tr','bl','br')))
pts=[]
for i in range(48):
    a=math.pi*2*i/48; r=64 if i%2==0 else 57
    pts.append(f"{70+r*math.sin(a):.1f},{70-r*math.cos(a):.1f}")
SEAL=('<svg class="seal" viewBox="0 0 140 170" aria-hidden="true">'
 '<path d="M48 110 34 166l16-10 10 14 10-50z" fill="#e8662c"/><path d="M92 110l14 56-16-10-10 14-10-50z" fill="#f5d76e"/>'
 f'<polygon points="{" ".join(pts)}" fill="#6d1820"/>'
 '<circle cx="70" cy="70" r="49" fill="none" stroke="#f5d76e" stroke-width="1.5" stroke-dasharray="3 4"/>'
 '<circle cx="70" cy="70" r="41" fill="#83222c"/>'
 '<path fill="#f5d76e" d="M70 42c1.9 16 11.7 25.8 28 28-16.3 2.2-26.1 12-28 28-1.9-16-11.7-25.8-28-28 16.3-2.2 26.1-12 28-28z"/></svg>')
t=t.replace('{{SEAL}}',SEAL)
assert '{{' not in t, t[t.index('{{'):t.index('{{')+40]
pathlib.Path('index.html').write_text(t)
print(len(t)//1024,'KB')

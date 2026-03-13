'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Mode = 'automation' | 'book' | 'template'

interface Product {
  id: string; title: string; mode: Mode; price: number
  suggestedPrice: number; marketDemand: string; competitorRange: string
  zipUrl: string; uploadedAt: string; status: 'draft' | 'published'; gumroadUrl?: string
}

interface Generated {
  title: string; tagline: string; description: string; longDescription: string
  targetAudience: string; suggestedPrice: number; priceRationale: string
  marketDemand: string; competitorRange: string; publishingChecklist: string[]
  faq: string[]; emailSequence: Array<{ subject: string; body: string }>
  salesCopy: string; stepByStepGuide?: string; setupGuide?: string
  fullContent?: string; customizationGuide?: string
  tableOfContents?: string[]; featuresIncluded?: string[]; templateType?: string; mode: Mode
}

const MODES: Record<Mode, { label: string; icon: string; color: string; glow: string; placeholder: string }> = {
  automation: { label: 'Make.com Blueprint', icon: '⚡', color: '#00fff9', glow: 'rgba(0,255,249,0.4)', placeholder: 'e.g., Automatically sync new Shopify orders to Google Sheets and send a Slack notification with order summary' },
  book:       { label: 'Ebook / Guide',      icon: '📘', color: '#ff00a0', glow: 'rgba(255,0,160,0.4)', placeholder: 'e.g., The Complete Guide to Building Passive Income with No-Code Tools in 2025' },
  template:   { label: 'Template Pack',      icon: '🗂',  color: '#ffe600', glow: 'rgba(255,230,0,0.4)',  placeholder: 'e.g., Notion freelance client management system with invoice tracker, project pipeline, time logging' }
}

function loadProducts(): Product[] { try { return JSON.parse(localStorage.getItem('bg_p') || '[]') } catch { return [] } }
function saveProducts(p: Product[]) { try { localStorage.setItem('bg_p', JSON.stringify(p)) } catch {} }

/* ─── MATRIX RAIN ─── */
function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const CHARS = 'アイウエオカキクケコ01234567890ABCDEF<>{}[]\\|/!@#$%^&*'
    const FS = 14; let cols = Math.floor(c.width / FS)
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * -150)
    const draw = () => {
      ctx.fillStyle = 'rgba(1,6,8,0.04)'; ctx.fillRect(0, 0, c.width, c.height)
      cols = Math.floor(c.width / FS)
      while (drops.length < cols) drops.push(0)
      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
        const y = drops[i] * FS
        if (i % 5 === 0) {
          ctx.fillStyle = '#00fff9'; ctx.shadowColor = '#00fff9'; ctx.shadowBlur = 12
        } else if (i % 11 === 0) {
          ctx.fillStyle = 'rgba(255,0,160,0.8)'; ctx.shadowColor = '#ff00a0'; ctx.shadowBlur = 8
        } else {
          const fade = Math.max(0.08, 0.55 - (drops[i] / (c.height / FS)) * 0.45)
          ctx.fillStyle = `rgba(0,255,65,${fade})`; ctx.shadowBlur = 0
        }
        ctx.font = `${FS}px 'Share Tech Mono', monospace`
        ctx.fillText(ch, i * FS, y)
        ctx.shadowBlur = 0
        if (y > c.height && Math.random() > 0.972) drops[i] = 0
        drops[i] += 0.5
      }
    }
    const id = setInterval(draw, 40)
    return () => { clearInterval(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.55, pointerEvents: 'none' }} />
}

/* ─── SCANLINES OVERLAY ─── */
function Scanlines() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, transparent, rgba(0,255,249,0.25), rgba(0,255,249,0.5), rgba(0,255,249,0.25), transparent)',
        animation: 'scanmove 6s linear infinite',
      }} />
    </div>
  )
}

/* ─── HEX TICKER ─── */
const H = '0123456789ABCDEF'
function rh(n: number) { return Array.from({ length: n }, () => H[Math.floor(Math.random() * 16)]).join('') }
function HexTicker({ n = 24 }: { n?: number }) {
  const [v, setV] = useState(rh(n))
  useEffect(() => { const id = setInterval(() => setV(rh(n)), 110); return () => clearInterval(id) }, [n])
  return <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.58rem', color: 'rgba(0,255,249,0.2)', letterSpacing: '0.06em' }}>{v}</span>
}

/* ─── GLITCH TEXT ─── */
function GlitchTitle({ text }: { text: string }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ fontFamily: 'Orbitron,monospace', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.15em', color: '#00fff9', textShadow: '0 0 20px #00fff9, 0 0 40px rgba(0,255,249,0.4), 0 0 80px rgba(0,255,249,0.15)' }}>
        {text}
      </span>
      <span aria-hidden style={{ position: 'absolute', inset: 0, fontFamily: 'Orbitron,monospace', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.15em', color: '#ff00a0', opacity: 0.6, animation: 'glitch1 4s infinite', clipPath: 'inset(40% 0 40% 0)' }}>
        {text}
      </span>
      <span aria-hidden style={{ position: 'absolute', inset: 0, fontFamily: 'Orbitron,monospace', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.15em', color: '#00ff41', opacity: 0.4, animation: 'glitch2 5s infinite', clipPath: 'inset(70% 0 10% 0)' }}>
        {text}
      </span>
    </div>
  )
}

/* ─── DEMAND BADGE ─── */
function Badge({ d }: { d: string }) {
  const c = d === 'HIGH' ? '#00ff41' : d === 'MEDIUM' ? '#ffe600' : '#ff00a0'
  return <span style={{ padding: '0.18rem 0.5rem', border: `1px solid ${c}55`, background: `${c}14`, color: c, fontSize: '0.56rem', fontFamily: 'Share Tech Mono,monospace', letterSpacing: '0.18em', textShadow: `0 0 12px ${c}`, whiteSpace: 'nowrap' }}>{d} DEMAND</span>
}

export default function Home() {
  const [view, setView] = useState<'studio' | 'tracker'>('studio')
  const [mode, setMode] = useState<Mode>('automation')
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generated, setGenerated] = useState<Generated | null>(null)
  const [price, setPrice] = useState(27)
  const [tab, setTab] = useState<'overview' | 'content' | 'email' | 'checklist'>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [zip, setZip] = useState<{ zipUrl: string; filename: string } | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [boot, setBoot] = useState<string[]>([])
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => { setProducts(loadProducts()) }, [])
  useEffect(() => { if (generated) setPrice(generated.suggestedPrice) }, [generated])

  const LINES = [
    '> BLUEGUM_STUDIO.EXE — cold boot...', '> Mounting neural synthesis engine... [OK]',
    '> Anthropic API bridge............. [CONNECTED]', '> Supabase storage layer............ [READY]',
    '> ZIP packaging module............. [LOADED]', '> Price intelligence system......... [ONLINE]',
    '> Product modes: 3 armed........... [ARMED]', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '> All systems nominal. Welcome, operator.',
  ]
  useEffect(() => {
    let i = 0
    const t = () => { if (i < LINES.length) { setBoot(p => [...p, LINES[i++]]); setTimeout(t, 150) } else setBootDone(true) }
    setTimeout(t, 300)
  }, [])

  const generate = useCallback(async () => {
    if (!idea.trim()) return
    setLoading(true); setError(''); setGenerated(null); setZip(null)
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: idea.trim(), mode }) })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || `HTTP ${r.status}`)
      setGenerated({ ...d, mode }); setTab('overview')
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [idea, mode])

  const upload = useCallback(async () => {
    if (!generated) return
    setUploading(true); setError('')
    try {
      const r = await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...generated, price, mode }) })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || `HTTP ${r.status}`)
      setZip({ zipUrl: d.zipUrl, filename: d.filename })
      const np: Product = { id: Date.now().toString(), title: generated.title, mode, price, suggestedPrice: generated.suggestedPrice, marketDemand: generated.marketDemand, competitorRange: generated.competitorRange, zipUrl: d.zipUrl, uploadedAt: d.uploadedAt, status: 'draft' }
      const u = [np, ...products]; setProducts(u); saveProducts(u)
    } catch (e) { setError((e as Error).message) }
    finally { setUploading(false) }
  }, [generated, price, mode, products])

  const markLive = (id: string, url: string) => {
    const u = products.map(p => p.id === id ? { ...p, status: 'published' as const, gumroadUrl: url } : p)
    setProducts(u); saveProducts(u); setEditId(null)
  }

  const mc = MODES[mode]

  return (
    <>
      <style>{`
        @keyframes scanmove { 0%{top:-3px} 100%{top:100vh} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #00fff9} 50%{opacity:0.4;box-shadow:0 0 2px #00fff9} }
        @keyframes blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes glitch1 { 0%,100%{transform:none;opacity:0} 7%{transform:skew(-2deg) translate(-4px);opacity:0.7} 8%{transform:none;opacity:0} 50%{transform:skew(1deg) translate(3px);opacity:0.5} 51%{opacity:0} }
        @keyframes glitch2 { 0%,100%{transform:none;opacity:0} 30%{transform:translate(4px) skew(1deg);opacity:0.4} 31%{opacity:0} 70%{transform:translate(-3px);opacity:0.3} 71%{opacity:0} }
        @keyframes neonPulse { 0%,100%{box-shadow:0 0 6px rgba(0,255,249,0.3),inset 0 0 6px rgba(0,255,249,0.05)} 50%{box-shadow:0 0 20px rgba(0,255,249,0.6),inset 0 0 15px rgba(0,255,249,0.1)} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(0,255,249,0.15)} 50%{border-color:rgba(0,255,249,0.45)} }

        * { box-sizing:border-box; margin:0; padding:0; }
        html,body { background:#010608 !important; }

        .p {
          border:1px solid rgba(0,255,249,0.12);
          background:rgba(0,10,14,0.88);
          position:relative; overflow:hidden;
          backdrop-filter:blur(8px);
        }
        .p::before { content:''; position:absolute; top:0;left:0;right:0;height:1px; background:linear-gradient(90deg,transparent,rgba(0,255,249,0.5),transparent); }
        .p::after { content:''; position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,20,26,0.3) 3px,rgba(0,20,26,0.3) 4px); }

        .inp {
          width:100%; background:rgba(0,255,249,0.03); border:1px solid rgba(0,255,249,0.12);
          color:#d0eaf5; font-family:'Share Tech Mono',monospace; font-size:0.78rem;
          padding:0.7rem 0.9rem; outline:none; resize:vertical; transition:all .2s;
        }
        .inp:focus { border-color:rgba(0,255,249,0.45); box-shadow:0 0 16px rgba(0,255,249,0.1),inset 0 0 10px rgba(0,255,249,0.04); color:#fff; }
        .inp::placeholder { color:rgba(0,255,249,0.18); }

        .btn {
          border:none; cursor:pointer; font-family:'Orbitron',monospace; font-weight:700;
          letter-spacing:0.1em; font-size:0.68rem; padding:0.85rem 1.5rem;
          position:relative; overflow:hidden; text-transform:uppercase; transition:all .2s;
        }
        .btn:disabled { opacity:0.3; cursor:not-allowed; }
        .btn::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(255,255,255,0.05),transparent); pointer-events:none; }

        .btn-c { background:rgba(0,255,249,0.06); border:1px solid rgba(0,255,249,0.35); color:#00fff9; text-shadow:0 0 10px #00fff9; }
        .btn-c:hover:not(:disabled) { background:rgba(0,255,249,0.14); box-shadow:0 0 30px rgba(0,255,249,0.25),inset 0 0 15px rgba(0,255,249,0.08); }
        .btn-p { background:rgba(255,0,160,0.06); border:1px solid rgba(255,0,160,0.35); color:#ff00a0; text-shadow:0 0 10px #ff00a0; }
        .btn-p:hover:not(:disabled) { background:rgba(255,0,160,0.14); box-shadow:0 0 30px rgba(255,0,160,0.25); }
        .btn-g { background:rgba(0,255,65,0.06); border:1px solid rgba(0,255,65,0.35); color:#00ff41; text-shadow:0 0 10px #00ff41; }
        .btn-g:hover:not(:disabled) { background:rgba(0,255,65,0.14); box-shadow:0 0 30px rgba(0,255,65,0.25); }
        .btn-y { background:rgba(255,230,0,0.06); border:1px solid rgba(255,230,0,0.35); color:#ffe600; text-shadow:0 0 10px #ffe600; }
        .btn-y:hover:not(:disabled) { background:rgba(255,230,0,0.14); box-shadow:0 0 30px rgba(255,230,0,0.25); }

        .tab { background:transparent; border:none; border-bottom:2px solid transparent; color:rgba(0,255,249,0.25); font-family:'Orbitron',monospace; font-size:0.55rem; letter-spacing:0.2em; padding:0.6rem 1rem; cursor:pointer; transition:all .2s; text-transform:uppercase; }
        .tab:hover { color:rgba(0,255,249,0.5); }
        .tab.on { border-bottom-color:#00fff9; color:#00fff9; text-shadow:0 0 14px #00fff9; }

        .lbl { font-size:0.56rem; letter-spacing:0.25em; color:rgba(0,255,249,0.35); text-transform:uppercase; margin-bottom:0.4rem; display:block; }
        .sp { width:14px; height:14px; border:2px solid rgba(0,255,249,0.15); border-top-color:#00fff9; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; flex-shrink:0; }
        .cx { color:#00fff9; text-shadow:0 0 20px #00fff9,0 0 50px rgba(0,255,249,0.3); }
        .cp { color:#ff00a0; text-shadow:0 0 20px #ff00a0,0 0 50px rgba(255,0,160,0.3); }
        .cy { color:#ffe600; text-shadow:0 0 20px #ffe600,0 0 50px rgba(255,230,0,0.3); }
        .cg { color:#00ff41; text-shadow:0 0 20px #00ff41,0 0 50px rgba(0,255,65,0.3); }

        .mb { background:rgba(0,255,249,0.02); border:1px solid rgba(0,255,249,0.1); padding:0.9rem 0.8rem; cursor:pointer; transition:all .25s; display:flex; flex-direction:column; align-items:flex-start; gap:0.35rem; flex:1; position:relative; }
        .mb::before { content:''; position:absolute; top:0;left:0;right:0;height:1px; background:rgba(0,255,249,0.18); }
        .mb:hover { background:rgba(0,255,249,0.05); border-color:rgba(0,255,249,0.25); }
        .mb.ac { background:rgba(0,255,249,0.08); border-color:rgba(0,255,249,0.45); box-shadow:0 0 24px rgba(0,255,249,0.1),inset 0 0 16px rgba(0,255,249,0.05); animation:neonPulse 3s ease infinite; }
        .mb.ap { background:rgba(255,0,160,0.08); border-color:rgba(255,0,160,0.45); box-shadow:0 0 24px rgba(255,0,160,0.1); }
        .mb.ay { background:rgba(255,230,0,0.08); border-color:rgba(255,230,0,0.45); box-shadow:0 0 24px rgba(255,230,0,0.1); }

        .tr { display:grid; grid-template-columns:2fr 0.5fr 0.8fr 1fr 1.2fr; gap:1rem; padding:0.8rem 1.25rem; border-bottom:1px solid rgba(0,255,249,0.05); align-items:center; }
        .cl { display:flex; gap:0.75rem; padding:0.55rem 0.85rem; border-left:2px solid rgba(0,255,249,0.25); margin-bottom:0.4rem; background:rgba(0,255,249,0.02); }
        .err { padding:0.85rem 1rem; border:1px solid rgba(255,0,160,0.4); background:rgba(255,0,160,0.06); animation:fadeUp .2s ease; border-left:3px solid #ff00a0; }

        details summary { list-style:none; cursor:pointer; }
        details summary::-webkit-details-marker { display:none; }
      `}</style>

      {/* Full-page dark base */}
      <div style={{ position: 'fixed', inset: 0, background: '#010608', zIndex: -1 }} />

      <MatrixRain />
      <Scanlines />

      {/* Ambient colour blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-25%', left: '-15%', width: 900, height: 900, background: 'radial-gradient(circle,rgba(0,255,249,0.05) 0%,transparent 60%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: 1000, height: 1000, background: 'radial-gradient(circle,rgba(255,0,160,0.04) 0%,transparent 60%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '35%', right: '15%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(0,255,65,0.03) 0%,transparent 60%)', filter: 'blur(70px)' }} />
      </div>

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ══ NAV ══ */}
        <nav style={{ height: 56, borderBottom: '1px solid rgba(0,255,249,0.12)', background: 'rgba(0,6,8,0.96)', backdropFilter: 'blur(20px)', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100 }}>
          {/* Pulsing dot */}
          <div style={{ width: 8, height: 8, background: '#00fff9', borderRadius: '50%', animation: 'pulse 2.5s ease infinite', flexShrink: 0 }} />
          <GlitchTitle text="BLUEGUM" />
          <span style={{ color: 'rgba(0,255,249,0.2)', fontSize: '0.9rem', fontFamily: 'Share Tech Mono,monospace' }}>//</span>
          <span style={{ fontSize: '0.58rem', letterSpacing: '0.28em', color: 'rgba(0,255,249,0.28)', fontFamily: 'Share Tech Mono,monospace', textTransform: 'uppercase' }}>Digital Product Studio</span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <HexTicker n={20} />
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.58rem', color: 'rgba(0,255,249,0.15)' }}>|</span>
            <HexTicker n={20} />
          </div>
          {(['studio', 'tracker'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`btn ${view === v ? 'btn-c' : ''}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.6rem', letterSpacing: '0.15em', background: view === v ? 'rgba(0,255,249,0.08)' : 'transparent', border: `1px solid ${view === v ? 'rgba(0,255,249,0.35)' : 'rgba(0,255,249,0.1)'}`, color: view === v ? '#00fff9' : 'rgba(0,255,249,0.3)', textShadow: view === v ? '0 0 10px #00fff9' : 'none' }}>
              {v === 'studio' ? '⚙ STUDIO' : `▦ PRODUCTS (${products.length})`}
            </button>
          ))}
        </nav>

        {/* ══ STATUS BAR ══ */}
        <div style={{ padding: '0.55rem 2rem', borderBottom: '1px solid rgba(0,255,249,0.06)', background: 'rgba(0,6,8,0.85)', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {[
            { k: 'CLAUDE_API', v: 'ACTIVE', c: '#00ff41' },
            { k: 'SUPABASE', v: 'READY', c: '#00fff9' },
            { k: 'MODE', v: mc.label.toUpperCase(), c: mc.color },
            { k: 'SYNTHESIS', v: loading ? 'RUNNING' : generated ? 'COMPLETE' : 'IDLE', c: loading ? '#ffe600' : generated ? '#00ff41' : 'rgba(0,255,249,0.25)' },
          ].map(({ k, v, c }) => (
            <div key={k} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: 4, height: 4, background: c, borderRadius: '50%', boxShadow: `0 0 6px ${c}` }} />
              <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.56rem', letterSpacing: '0.18em', color: 'rgba(0,255,249,0.3)' }}>{k}</span>
              <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.6rem', color: c, textShadow: `0 0 8px ${c}` }}>{v}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <HexTicker n={32} />
        </div>

        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '1.75rem 1.5rem 4rem' }}>

          {/* ════════ STUDIO ════════ */}
          {view === 'studio' && (
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.25rem', alignItems: 'start' }}>

              {/* ── LEFT COLUMN ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Boot log */}
                {!bootDone && (
                  <div className="p" style={{ padding: '1rem' }}>
                    <span className="lbl">SYSTEM BOOT SEQUENCE</span>
                    {boot.map((l, i) => (
                      <div key={i} style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.66rem', lineHeight: 1.7, animation: 'fadeUp .15s ease', color: l.includes('[OK]') || l.includes('[CONNECTED]') || l.includes('[READY]') || l.includes('[LOADED]') || l.includes('[ARMED]') || l.includes('[ONLINE]') || l.includes('Welcome') ? '#00ff41' : l.startsWith('━') ? 'rgba(0,255,249,0.2)' : 'rgba(0,255,249,0.5)' }}>
                        {l}
                      </div>
                    ))}
                    {!bootDone && <span style={{ color: '#00fff9', fontSize: '0.66rem', fontFamily: 'Share Tech Mono,monospace', animation: 'blink 1s step-end infinite' }}>▌</span>}
                  </div>
                )}

                {/* Mode buttons */}
                <div className="p" style={{ padding: '1.25rem' }}>
                  <span className="lbl">PRODUCT TYPE</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([k, cfg]) => {
                      const isActive = mode === k
                      const cls = isActive ? (k === 'book' ? 'ap' : k === 'template' ? 'ay' : 'ac') : ''
                      return (
                        <button key={k} onClick={() => { setMode(k); setGenerated(null); setZip(null) }} className={`mb ${cls}`}>
                          <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
                          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.6rem', lineHeight: 1.4, color: isActive ? cfg.color : 'rgba(0,255,249,0.3)', textShadow: isActive ? `0 0 10px ${cfg.color}` : 'none' }}>
                            {cfg.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Idea input */}
                <div className="p" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span className="lbl" style={{ marginBottom: 0 }}>DESCRIBE YOUR PRODUCT</span>
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.58rem', color: mc.color, textShadow: `0 0 8px ${mc.color}` }}>
                      {mc.icon} {mc.label}
                    </span>
                  </div>
                  <textarea className="inp" rows={5} placeholder={mc.placeholder} value={idea}
                    onChange={e => setIdea(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.55rem', color: 'rgba(0,255,249,0.2)' }}>
                      {String(idea.length).padStart(4, '0')} CHARS · ⌘↵ TO RUN
                    </span>
                  </div>
                  <button onClick={generate} disabled={loading || !idea.trim()} className="btn btn-c" style={{ width: '100%', marginTop: '1rem' }}>
                    {loading
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}><span className="sp" /> SYNTHESIZING DATA STREAM...</span>
                      : `⚡ GENERATE ${mc.label.toUpperCase()}`}
                  </button>
                </div>

                {/* Price + Package */}
                {generated && (
                  <div className="p" style={{ padding: '1.25rem', borderColor: 'rgba(255,230,0,0.2)', animation: 'fadeUp .3s ease' }}>
                    <style>{`.p-y::before{background:linear-gradient(90deg,transparent,rgba(255,230,0,0.5),transparent)}`}</style>
                    <span className="lbl">PRICING INTELLIGENCE</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '0.85rem', border: '1px solid rgba(255,230,0,0.2)', background: 'rgba(255,230,0,0.04)' }}>
                        <span className="lbl" style={{ color: 'rgba(255,230,0,0.4)' }}>AI SUGGESTED</span>
                        <div className="cy" style={{ fontFamily: 'Orbitron,monospace', fontWeight: 900, fontSize: '1.7rem' }}>${generated.suggestedPrice}</div>
                        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.58rem', color: 'rgba(255,230,0,0.4)' }}>Market: {generated.competitorRange}</span>
                      </div>
                      <div style={{ padding: '0.85rem', border: '1px solid rgba(0,255,249,0.12)', background: 'rgba(0,255,249,0.03)' }}>
                        <span className="lbl">YOUR PRICE</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span className="cx" style={{ fontFamily: 'Orbitron,monospace', fontSize: '1.1rem' }}>$</span>
                          <input type="number" value={price} min={1} onChange={e => setPrice(Number(e.target.value))} className="inp"
                            style={{ width: 72, fontSize: '1.1rem', fontFamily: 'Orbitron,monospace', color: '#00fff9', textShadow: '0 0 10px #00fff9', padding: '0.25rem 0.4rem', fontWeight: 700 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '0.65rem 0.85rem', border: '1px solid rgba(255,230,0,0.1)', background: 'rgba(0,0,0,0.25)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.4rem' }}><Badge d={generated.marketDemand} /></div>
                      <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.64rem', color: 'rgba(184,220,232,0.42)', lineHeight: 1.65, display: 'block' }}>{generated.priceRationale}</span>
                    </div>
                    <button onClick={upload} disabled={uploading || !!zip} className={`btn ${zip ? 'btn-g' : 'btn-p'}`} style={{ width: '100%' }}>
                      {uploading
                        ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}><span className="sp" style={{ borderTopColor: '#ff00a0' }} /> UPLOADING TO SUPABASE...</span>
                        : zip ? '✓ PACKAGED & STORED' : '📦 PACKAGE & UPLOAD TO SUPABASE'}
                    </button>
                    {zip && (
                      <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeUp .3s ease' }}>
                        <a href={zip.zipUrl} download className="btn btn-g" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', textDecoration: 'none', fontSize: '0.65rem' }}>
                          ⬇ DOWNLOAD ZIP — Ready for Gumroad
                        </a>
                        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.55rem', color: 'rgba(0,255,249,0.28)', wordBreak: 'break-all', lineHeight: 1.5 }}>📁 {zip.filename}</span>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="err">
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', color: '#ff00a0', fontSize: '0.7rem', textShadow: '0 0 10px rgba(255,0,160,0.5)' }}>❌ {error}</span>
                  </div>
                )}
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div style={{ minHeight: 500 }}>
                {!generated && !loading && (
                  <div className="p" style={{ minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '3rem' }}>
                    <span style={{ fontSize: '4rem', opacity: 0.2, filter: 'grayscale(1)' }}>{mc.icon}</span>
                    <span className="cx" style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.8rem', letterSpacing: '0.3em', opacity: 0.4 }}>AWAITING INPUT</span>
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.65rem', color: 'rgba(0,255,249,0.22)', textAlign: 'center', maxWidth: 280, lineHeight: 1.75 }}>
                      Describe your {mc.label} idea and press Generate.<br />Claude will write the complete product.
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', opacity: 0.3, marginTop: '0.5rem' }}>
                      <HexTicker n={40} /><HexTicker n={36} /><HexTicker n={44} /><HexTicker n={32} />
                    </div>
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.6rem', color: 'rgba(0,255,249,0.15)', animation: 'blink 1s step-end infinite' }}>▌</span>
                  </div>
                )}

                {loading && (
                  <div className="p" style={{ minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '3rem' }}>
                    <div style={{ width: 48, height: 48, border: '3px solid rgba(0,255,249,0.12)', borderTopColor: '#00fff9', borderRadius: '50%', animation: 'spin .8s linear infinite', boxShadow: '0 0 20px rgba(0,255,249,0.3)' }} />
                    <span className="cx" style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.8rem', letterSpacing: '0.25em' }}>SYNTHESIZING...</span>
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.65rem', color: 'rgba(0,255,249,0.38)', textAlign: 'center' }}>Claude is generating your complete {mc.label}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', opacity: 0.45 }}>
                      <HexTicker n={40} /><HexTicker n={34} /><HexTicker n={46} /><HexTicker n={30} /><HexTicker n={38} />
                    </div>
                  </div>
                )}

                {generated && (
                  <div className="p" style={{ padding: 0, animation: 'fadeUp .3s ease' }}>
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,255,249,0.08)', background: 'rgba(0,15,22,0.7)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontFamily: 'Orbitron,monospace', fontWeight: 700, fontSize: '1rem', color: '#00fff9', textShadow: '0 0 20px #00fff9, 0 0 40px rgba(0,255,249,0.3)', lineHeight: 1.3, flex: 1 }}>
                          {generated.title}
                        </h2>
                        <Badge d={generated.marketDemand} />
                      </div>
                      <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.7rem', color: 'rgba(184,220,232,0.42)', lineHeight: 1.6 }}>{generated.tagline}</p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,255,249,0.08)', background: 'rgba(0,0,0,0.3)', paddingLeft: '0.5rem' }}>
                      {([
                        { k: 'overview', l: 'OVERVIEW' },
                        { k: 'content', l: generated.mode === 'book' ? 'FULL CONTENT' : generated.mode === 'template' ? 'SETUP GUIDE' : 'BUILD GUIDE' },
                        { k: 'email', l: `EMAILS (${generated.emailSequence?.length ?? 0})` },
                        { k: 'checklist', l: '📋 PUBLISH STEPS' },
                      ] as const).map(t => (
                        <button key={t.k} onClick={() => setTab(t.k)} className={`tab ${tab === t.k ? 'on' : ''}`}>{t.l}</button>
                      ))}
                    </div>

                    <div style={{ padding: '1.5rem', maxHeight: 560, overflowY: 'auto' }}>

                      {tab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '0.85rem', border: '1px solid rgba(0,255,249,0.08)', background: 'rgba(0,255,249,0.02)' }}>
                              <span className="lbl">TARGET AUDIENCE</span>
                              <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.7rem', lineHeight: 1.65, color: 'rgba(184,220,232,0.62)' }}>{generated.targetAudience}</p>
                            </div>
                            <div style={{ padding: '0.85rem', border: '1px solid rgba(255,230,0,0.12)', background: 'rgba(255,230,0,0.02)' }}>
                              <span className="lbl">MARKET INTEL</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.66rem', color: 'rgba(255,230,0,0.5)' }}>Range: {generated.competitorRange}</span>
                                <Badge d={generated.marketDemand} />
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="lbl">SHORT DESCRIPTION</span>
                            <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.72rem', lineHeight: 1.7, color: 'rgba(184,220,232,0.68)' }}>{generated.description}</p>
                          </div>
                          <div>
                            <span className="lbl">GUMROAD PAGE COPY</span>
                            <div style={{ border: '1px solid rgba(0,255,249,0.08)', background: 'rgba(0,0,0,0.3)', padding: '1rem', maxHeight: 180, overflowY: 'auto' }}>
                              <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.69rem', lineHeight: 1.75, color: 'rgba(184,220,232,0.6)', whiteSpace: 'pre-wrap' }}>{generated.longDescription}</p>
                            </div>
                          </div>
                          {generated.tableOfContents && (
                            <div>
                              <span className="lbl">TABLE OF CONTENTS</span>
                              {generated.tableOfContents.map((ch, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,0,160,0.06)' }}>
                                  <span className="cp" style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.6rem', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                                  <span style={{ fontFamily: 'Share Tech Mono,monospace', color: 'rgba(184,220,232,0.6)', fontSize: '0.68rem' }}>{ch}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {generated.featuresIncluded && (
                            <div>
                              <span className="lbl">FEATURES INCLUDED</span>
                              {generated.featuresIncluded.map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0' }}>
                                  <span className="cg" style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.65rem' }}>✓</span>
                                  <span style={{ fontFamily: 'Share Tech Mono,monospace', color: 'rgba(184,220,232,0.62)', fontSize: '0.7rem' }}>{f}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div>
                            <span className="lbl">SALES COPY</span>
                            <div style={{ border: '1px solid rgba(255,0,160,0.12)', background: 'rgba(255,0,160,0.03)', padding: '1rem' }}>
                              <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.7rem', lineHeight: 1.75, color: 'rgba(184,220,232,0.62)', whiteSpace: 'pre-wrap' }}>{generated.salesCopy}</p>
                            </div>
                          </div>
                          <div>
                            <span className="lbl">FAQ ({generated.faq?.length ?? 0})</span>
                            {(generated.faq ?? []).map((item, i) => (
                              <div key={i} style={{ padding: '0.5rem 0.85rem', marginBottom: '0.35rem', border: '1px solid rgba(0,255,249,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.67rem', lineHeight: 1.65, color: 'rgba(184,220,232,0.58)' }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tab === 'content' && (
                        <pre style={{ fontFamily: 'Share Tech Mono,monospace', whiteSpace: 'pre-wrap', fontSize: '0.7rem', lineHeight: 1.9, color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.2)' }}>
                          {generated.stepByStepGuide || generated.setupGuide || generated.fullContent || generated.customizationGuide || 'No content generated'}
                        </pre>
                      )}

                      {tab === 'email' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {(generated.emailSequence ?? []).map((email, i) => (
                            <details key={i} style={{ border: '1px solid rgba(0,255,249,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                              <summary style={{ padding: '0.8rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', userSelect: 'none' }}>
                                <span style={{ fontFamily: 'Share Tech Mono,monospace', color: '#ffe600', textShadow: '0 0 8px #ffe600', fontSize: '0.6rem', flexShrink: 0 }}>EMAIL {String(i + 1).padStart(2, '0')}</span>
                                <span style={{ fontFamily: 'Share Tech Mono,monospace', color: 'rgba(0,255,249,0.6)', fontSize: '0.7rem' }}>{email.subject}</span>
                              </summary>
                              <div style={{ padding: '1rem', borderTop: '1px solid rgba(0,255,249,0.08)' }}>
                                <pre style={{ fontFamily: 'Share Tech Mono,monospace', whiteSpace: 'pre-wrap', fontSize: '0.68rem', lineHeight: 1.8, color: 'rgba(184,220,232,0.62)' }}>{email.body}</pre>
                              </div>
                            </details>
                          ))}
                        </div>
                      )}

                      {tab === 'checklist' && (
                        <div>
                          <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', border: `1px solid ${zip ? 'rgba(0,255,65,0.25)' : 'rgba(255,230,0,0.2)'}`, background: zip ? 'rgba(0,255,65,0.04)' : 'rgba(255,230,0,0.03)' }}>
                            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.68rem', color: zip ? '#00ff41' : '#ffe600', textShadow: zip ? '0 0 8px rgba(0,255,65,0.5)' : 'none', lineHeight: 1.6, display: 'block' }}>
                              {zip ? '✓ ZIP READY — Download it above, then follow these steps to publish on Gumroad.' : '⚠ Package your product first, then download the ZIP before following these steps.'}
                            </span>
                          </div>
                          {(generated.publishingChecklist ?? []).map((step, i) => (
                            <div key={i} className="cl">
                              <span style={{ fontFamily: 'Orbitron,monospace', color: '#00fff9', textShadow: '0 0 8px #00fff9', fontSize: '0.6rem', flexShrink: 0, minWidth: 24 }}>{String(i + 1).padStart(2, '0')}.</span>
                              <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.7rem', lineHeight: 1.65, color: 'rgba(184,220,232,0.65)' }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ TRACKER ════════ */}
          {view === 'tracker' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <GlitchTitle text="PRODUCT TRACKER" />
                  <div style={{ marginTop: '0.3rem' }}>
                    <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.6rem', color: 'rgba(0,255,249,0.3)' }}>
                      {products.length} products · {products.filter(p => p.status === 'published').length} published · {products.filter(p => p.status === 'draft').length} draft
                    </span>
                  </div>
                </div>
                <button onClick={() => setView('studio')} className="btn btn-c">+ NEW PRODUCT</button>
              </div>
              {products.length === 0 ? (
                <div className="p" style={{ padding: '4rem', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Share Tech Mono,monospace', color: 'rgba(0,255,249,0.2)', fontSize: '0.75rem' }}>No products yet. Generate and package your first product in Studio.</span>
                </div>
              ) : (
                <div className="p" style={{ padding: 0 }}>
                  <div className="tr" style={{ borderBottom: '1px solid rgba(0,255,249,0.1)', background: 'rgba(0,15,22,0.8)' }}>
                    {['PRODUCT', 'TYPE', 'PRICE', 'DEMAND', 'STATUS / ACTIONS'].map(h => <span key={h} className="lbl" style={{ marginBottom: 0 }}>{h}</span>)}
                  </div>
                  {products.map(p => (
                    <div key={p.id}>
                      <div className="tr" style={{ animation: 'fadeUp .2s ease' }}>
                        <div>
                          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.72rem', color: 'rgba(184,220,232,0.82)', display: 'block', marginBottom: '0.2rem' }}>{p.title}</span>
                          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.55rem', color: 'rgba(0,255,249,0.22)' }}>{new Date(p.uploadedAt).toLocaleDateString()} · {p.mode}</span>
                        </div>
                        <span style={{ fontSize: '1rem' }}>{MODES[p.mode].icon}</span>
                        <div>
                          <span className="cy" style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.9rem' }}>${p.price}</span>
                          {p.price !== p.suggestedPrice && <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.55rem', color: 'rgba(0,255,249,0.22)', display: 'block' }}>AI: ${p.suggestedPrice}</span>}
                        </div>
                        <Badge d={p.marketDemand} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {p.status === 'published' ? (
                            <div>
                              <span className="cg" style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.62rem', display: 'block' }}>✓ PUBLISHED</span>
                              {p.gumroadUrl && <a href={p.gumroadUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.58rem', color: '#00fff9', textDecoration: 'underline', textShadow: '0 0 6px #00fff9' }}>View on Gumroad →</a>}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <a href={p.zipUrl} download className="btn btn-c" style={{ fontSize: '0.55rem', padding: '0.3rem 0.6rem', textDecoration: 'none', textAlign: 'center' }}>⬇ ZIP</a>
                              <button onClick={() => setEditId(editId === p.id ? null : p.id)} className="btn btn-g" style={{ fontSize: '0.55rem', padding: '0.3rem 0.6rem' }}>✓ LIVE</button>
                            </div>
                          )}
                        </div>
                      </div>
                      {editId === p.id && (
                        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,255,65,0.04)', borderBottom: '1px solid rgba(0,255,65,0.1)', display: 'flex', gap: '0.75rem', alignItems: 'center', animation: 'fadeUp .2s ease' }}>
                          <input className="inp" style={{ flex: 1, padding: '0.4rem 0.7rem', fontSize: '0.7rem' }} placeholder="Paste Gumroad product URL (optional)" id={`u-${p.id}`} />
                          <button onClick={() => { const el = document.getElementById(`u-${p.id}`) as HTMLInputElement; markLive(p.id, el?.value || '') }} className="btn btn-g" style={{ padding: '0.4rem 1rem', fontSize: '0.62rem' }}>SAVE</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,255,249,0.06)', paddingTop: '1rem', opacity: 0.2 }}>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.56rem', color: 'rgba(0,255,249,0.5)' }}>BLUEGUM_STUDIO // ALL SYSTEMS OPERATIONAL</span>
            <HexTicker n={28} />
          </div>
        </div>
      </div>
    </>
  )
}

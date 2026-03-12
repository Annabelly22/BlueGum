'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ══════════════════════════════════
   TYPES
══════════════════════════════════ */
interface GeneratedContent {
  title: string
  description: string
  longDescription: string
  stepByStepGuide: string
  faq: string[]
  emailSequence: Array<{ subject: string; body: string }>
  salesCopy: string
  demandData?: any
}

interface LogEntry {
  id: number
  text: string
  type: 'system' | 'info' | 'success' | 'error' | 'warn' | 'data'
  ts: string
}

/* ══════════════════════════════════
   MATRIX RAIN CANVAS
══════════════════════════════════ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>{}[]|\\/'
    const fontSize = 13
    let cols = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(cols).fill(1).map(() => Math.random() * -100)

    const draw = () => {
      ctx.fillStyle = 'rgba(1,6,8,0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      cols = Math.floor(canvas.width / fontSize)

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const progress = drops[i] / (canvas.height / fontSize)

        if (progress < 0.1) {
          ctx.fillStyle = `rgba(0,255,249,${0.05 + progress * 0.1})`
        } else if (i % 7 === 0 && drops[i] > 0) {
          ctx.fillStyle = 'rgba(0,255,249,0.9)'
          ctx.shadowBlur = 8
          ctx.shadowColor = '#00fff9'
        } else {
          ctx.fillStyle = `rgba(0,255,65,${Math.max(0, 0.4 - progress * 0.3)})`
          ctx.shadowBlur = 0
        }

        ctx.font = `${fontSize}px Share Tech Mono, monospace`
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        ctx.shadowBlur = 0

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += 0.4
      }
    }

    const interval = setInterval(draw, 45)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        opacity: 0.18, pointerEvents: 'none'
      }}
    />
  )
}

/* ══════════════════════════════════
   HEX STREAM (live updating)
══════════════════════════════════ */
const HEX = '0123456789ABCDEF'
function rndHex(n: number) {
  return Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join('')
}

function HexStream({ len = 32 }: { len?: number }) {
  const [val, setVal] = useState(rndHex(len))
  useEffect(() => {
    const id = setInterval(() => setVal(rndHex(len)), 100)
    return () => clearInterval(id)
  }, [len])
  return <span className="hex-deco">{val}</span>
}

/* ══════════════════════════════════
   TYPING TEXT
══════════════════════════════════ */
function TypeIn({ text, speed = 25, className = '' }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i))
      } else {
        clearInterval(id)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return <span className={className}>{displayed}<span style={{ animation: 'blink-cursor 1s infinite', opacity: displayed.length < text.length ? 1 : 0 }}>▌</span></span>
}

/* ══════════════════════════════════
   BREACH BAR
══════════════════════════════════ */
function BreachBar({ show }: { show: boolean }) {
  if (!show) return null
  return <div className="breach-bar" />
}

/* ══════════════════════════════════
   BOOT MESSAGES
══════════════════════════════════ */
const BOOT: Array<{ text: string; type: LogEntry['type'] }> = [
  { text: 'BLUEGUM_STUDIO.EXE v2.7.1 — cold boot sequence initiated', type: 'system' },
  { text: 'Loading neural synthesis engine............... [OK]', type: 'system' },
  { text: 'Mounting Anthropic API bridge.................. [OK]', type: 'system' },
  { text: 'Initializing Gumroad commerce module........... [READY]', type: 'system' },
  { text: 'SerpAPI market scanner......................... [OPTIONAL]', type: 'system' },
  { text: 'PDF render pipeline............................ [LOADED]', type: 'system' },
  { text: 'ZIP packaging module........................... [LOADED]', type: 'system' },
  { text: 'Circuit integrity check........................ [PASSED]', type: 'success' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'data' },
  { text: 'All systems nominal. Operator clearance granted.', type: 'success' },
]

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
export default function Home() {
  const [idea, setIdea]           = useState('')
  const [useSerp, setUseSerp]     = useState(false)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [loading, setLoading]     = useState(false)
  const [price, setPrice]         = useState(39)
  const [logs, setLogs]           = useState<LogEntry[]>([])
  const [logId, setLogId]         = useState(0)
  const [published, setPublished] = useState(false)
  const [pubUrl, setPubUrl]       = useState('')
  const [zipBase64, setZipBase64] = useState('')
  const [productId, setProductId] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'guide' | 'email'>('edit')
  const [breach, setBreach]       = useState(false)
  const [bootDone, setBootDone]   = useState(false)
  const [showContent, setShowContent] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const idRef  = useRef(0)

  const now = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
  }

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = { id: idRef.current++, text, type, ts: now() }
    setLogs(prev => [...prev.slice(-60), entry])
  }, [])

  // scroll log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  // boot sequence
  useEffect(() => {
    let i = 0
    const tick = () => {
      if (i < BOOT.length) {
        const { text, type } = BOOT[i]
        addLog(text, type)
        i++
        setTimeout(tick, 180)
      } else {
        setBootDone(true)
      }
    }
    setTimeout(tick, 300)
  }, [addLog])

  /* ── GENERATE ── */
  const handleGenerate = async () => {
    if (!idea.trim()) return
    setLoading(true)
    setBreach(true)
    setTimeout(() => setBreach(false), 900)

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'data')
    addLog(`SYNTHESIS INITIATED — parsing concept string...`, 'info')
    addLog(`INPUT: "${idea.slice(0, 60)}${idea.length > 60 ? '...' : ''}"`, 'data')
    addLog('Routing request to Claude neural core...', 'info')
    addLog('Awaiting response from API cluster...', 'warn')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim(), useSerp }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setGenerated(data)
      setShowContent(true)
      addLog('Neural synthesis complete.', 'success')
      addLog(`Product title encoded: "${data.title}"`, 'success')
      addLog(`FAQ nodes generated: ${data.faq?.length ?? 0}`, 'data')
      addLog(`Email sequence nodes: ${data.emailSequence?.length ?? 0}`, 'data')
      addLog('Output matrix ready for review.', 'success')
      setActiveTab('edit')
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`, 'error')
      addLog('Check: ANTHROPIC_API_KEY in Vercel env vars', 'warn')
      addLog('Check: Vercel Function Logs for full stack trace', 'warn')
    } finally {
      setLoading(false)
    }
  }

  /* ── PUBLISH ── */
  const handlePublish = async () => {
    if (!generated) return
    setLoading(true)
    setBreach(true)
    setTimeout(() => setBreach(false), 900)

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'data')
    addLog('DEPLOY SEQUENCE INITIATED', 'info')
    addLog('Rendering PDF artifact...', 'info')
    addLog('Compressing ZIP payload...', 'info')
    addLog('Handshaking with Gumroad API...', 'warn')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...generated, price }),
      })
      const data = await res.json()

      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)

      setPublished(true)
      setPubUrl(data.productUrl)
      if (data.zipBase64) setZipBase64(data.zipBase64)
      if (data.productId) setProductId(data.productId)
      addLog('DEPLOY SUCCESSFUL ✓', 'success')
      addLog(`Product URL: ${data.productUrl}`, 'success')
      addLog('ACTION REQUIRED: Upload ZIP via Gumroad dashboard → Edit Product → Files', 'warn')
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`, 'error')
      addLog('Check: GUMROAD_ACCESS_TOKEN in Vercel env vars', 'warn')
    } finally {
      setLoading(false)
    }
  }

  /* ── LOG COLORS ── */
  const logColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'var(--green)'
      case 'error':   return 'var(--pink)'
      case 'warn':    return 'var(--yellow)'
      case 'data':    return 'rgba(0,255,249,0.35)'
      case 'system':  return 'rgba(0,255,249,0.55)'
      default:        return 'rgba(180,220,235,0.75)'
    }
  }

  /* ── STATUS ── */
  const statuses = [
    { label: 'CLAUDE_API',  val: bootDone ? 'READY' : 'INIT',     col: bootDone ? 'var(--green)' : 'var(--yellow)' },
    { label: 'GUMROAD',     val: 'READY',                           col: 'var(--cyan)' },
    { label: 'SERPAPI',     val: useSerp ? 'ARMED' : 'STANDBY',    col: useSerp ? 'var(--yellow)' : 'rgba(0,255,249,0.3)' },
    { label: 'PDF_RENDER',  val: 'LOADED',                          col: 'var(--cyan)' },
    { label: 'SYNTHESIS',   val: generated ? 'COMPLETE' : loading ? 'ACTIVE' : 'IDLE',
      col: generated ? 'var(--green)' : loading ? 'var(--yellow)' : 'rgba(0,255,249,0.3)' },
    { label: 'GUMROAD_TX',  val: published ? 'DEPLOYED' : 'IDLE',  col: published ? 'var(--green)' : 'rgba(0,255,249,0.3)' },
  ]

  /* ══════════════════════════════════
     RENDER
  ══════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BreachBar show={breach} />
      <MatrixRain />

      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(0,255,249,0.05) 0%, transparent 65%)',
          borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 800, height: 800,
          background: 'radial-gradient(circle, rgba(255,0,160,0.04) 0%, transparent 65%)',
          borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '35%', left: '35%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,255,65,0.03) 0%, transparent 65%)',
          borderRadius: '50%', filter: 'blur(60px)' }} />
      </div>

      {/* ── CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: '2.5rem' }}>
          {/* system bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem',
            borderBottom: '1px solid rgba(0,255,249,0.08)', paddingBottom: '0.75rem' }}>
            <span className="dot-green" />
            <span className="dot-cyan" style={{ animationDelay: '.3s' }} />
            <span className="dot-pink" style={{ animationDelay: '.6s' }} />
            <span style={{ flex: 1, borderLeft: '1px solid rgba(0,255,249,0.12)', marginLeft: '0.5rem', paddingLeft: '0.75rem' }}>
              <span className="cyber-tag" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>
                BLUEGUM_STUDIO // OPERATOR TERMINAL // SESSION ACTIVE
              </span>
            </span>
            <HexStream len={16} />
          </div>

          {/* title */}
          <div style={{ marginBottom: '0.5rem' }}>
            <h1 className="font-title flicker" style={{
              fontSize: 'clamp(2.2rem, 7vw, 4.2rem)', fontWeight: 900,
              letterSpacing: '-0.03em', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '0.15em'
            }}>
              <span className="glitch-wrap glow-cyan" data-text="BLUEPRINT">BLUEPRINT</span>
              <span style={{ color: 'rgba(0,255,249,0.2)', fontSize: '0.7em' }}>/</span>
              <span className="glow-pink" style={{ fontSize: '0.65em' }}>GENERATOR</span>
            </h1>
          </div>

          <p className="font-body" style={{
            color: 'rgba(184,220,232,0.38)', letterSpacing: '0.32em',
            textTransform: 'uppercase', fontSize: '0.78rem', marginBottom: '1rem'
          }}>
            Make.com Automation Blueprint Factory // Powered by Claude AI
          </p>

          {/* hex stream row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', overflow: 'hidden' }}>
            <HexStream len={24} />
            <span className="hex-deco" style={{ color: 'rgba(255,0,160,0.25)' }}>█░█░█░█</span>
            <HexStream len={24} />
          </div>
        </header>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── INPUT PANEL ── */}
            <div className="cyber-panel panel-accent-cyan" style={{ padding: '1.75rem' }}>
              <div className="sweep-light" />
              <div className="scan-line" />

              {/* panel header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="dot-cyan" />
                  <span className="cyber-label" style={{ marginBottom: 0, opacity: 1, fontSize: '0.65rem' }}>
                    AUTOMATION CONCEPT INPUT
                  </span>
                </div>
                <span className="cyber-tag" style={{ fontSize: '0.62rem', opacity: 0.6 }}>MODULE_01</span>
              </div>

              {/* textarea */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p className="cyber-label">Describe your automation workflow</p>
                <textarea
                  className="cyber-input"
                  rows={6}
                  placeholder={`e.g., watch for new Shopify orders → append to Google Sheet → send daily summary email with error handling and retries`}
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  style={{ minHeight: 130 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                  <span className="hex-deco" style={{ fontSize: '0.58rem' }}>
                    CHARS: {String(idea.length).padStart(4, '0')} / 2048
                  </span>
                </div>
              </div>

              {/* SerpAPI toggle */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'crosshair', padding: '0.6rem 0.8rem',
                  border: '1px solid', borderColor: useSerp ? 'rgba(0,255,249,0.25)' : 'rgba(0,255,249,0.08)',
                  background: useSerp ? 'rgba(0,255,249,0.04)' : 'transparent', transition: 'all .25s' }}
                onClick={() => setUseSerp(v => !v)}
              >
                <div className="cyber-toggle-track" style={{
                  borderColor: useSerp ? 'var(--cyan)' : 'rgba(0,255,249,0.2)',
                  background: useSerp ? 'rgba(0,255,249,0.15)' : 'rgba(0,255,249,0.04)',
                  boxShadow: useSerp ? '0 0 12px rgba(0,255,249,0.35)' : 'none'
                }}>
                  <div className="cyber-toggle-thumb" style={{
                    left: useSerp ? 22 : 4,
                    background: useSerp ? 'var(--cyan)' : 'rgba(0,255,249,0.35)',
                    boxShadow: useSerp ? '0 0 10px var(--cyan)' : 'none'
                  }} />
                </div>
                <div>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'rgba(0,255,249,0.6)', display: 'block' }}>
                    SERPAPI_MARKET_SCAN{' '}
                    <span style={{ color: useSerp ? 'var(--green)' : 'rgba(0,255,249,0.25)',
                      textShadow: useSerp ? '0 0 8px var(--green)' : 'none' }}>
                      {useSerp ? '[ ENABLED ]' : '[ DISABLED ]'}
                    </span>
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.58rem', color: 'rgba(0,255,249,0.3)' }}>
                    Google market research on your automation niche
                  </span>
                </div>
              </div>

              {/* Generate button */}
              <button onClick={handleGenerate} disabled={loading || !idea.trim()} className="btn-cyber">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  {loading ? (
                    <><div className="spinner" /> <span>SYNTHESIZING DATA STREAM...</span></>
                  ) : (
                    <><span style={{ color: 'var(--pink)', textShadow: '0 0 8px var(--pink)' }}>⚡</span>
                    <span>INITIALIZE BLUEPRINT SYNTHESIS</span></>
                  )}
                </div>
              </button>

              {loading && (
                <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                  <div className="progress-bar-fill" style={{ '--target': '90%' } as any} />
                </div>
              )}
            </div>

            {/* ── OUTPUT PANEL ── */}
            {showContent && generated && (
              <div className="cyber-panel panel-accent-green" style={{ padding: '1.75rem' }}>
                <div className="sweep-light" />
                <div className="scan-line" style={{ animationDelay: '2s' }} />

                {/* panel header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="dot-green" />
                    <span className="cyber-label" style={{ marginBottom: 0, opacity: 1, fontSize: '0.65rem' }}>
                      OUTPUT MATRIX
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="hex-deco" style={{ fontSize: '0.58rem', color: 'var(--green)', opacity: 0.6 }}>SYNTHESIS_OK</span>
                    <span className="cyber-tag" style={{ fontSize: '0.62rem', opacity: 0.6 }}>MODULE_02</span>
                  </div>
                </div>

                {/* tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,255,249,0.1)', marginBottom: '1.5rem', gap: 0 }}>
                  {([
                    { key: 'edit',  label: 'CONTENT EDIT' },
                    { key: 'guide', label: 'BUILD GUIDE' },
                    { key: 'email', label: `EMAIL_SEQ [${generated.emailSequence?.length ?? 0}]` },
                  ] as const).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className="font-title"
                      style={{
                        fontSize: '0.6rem', padding: '0.5rem 1rem', background: 'transparent', border: 'none',
                        borderBottom: activeTab === tab.key ? '2px solid var(--cyan)' : '2px solid transparent',
                        color: activeTab === tab.key ? 'var(--cyan)' : 'rgba(0,255,249,0.3)',
                        cursor: 'crosshair', letterSpacing: '0.15em', textTransform: 'uppercase',
                        textShadow: activeTab === tab.key ? '0 0 10px var(--cyan)' : 'none',
                        transition: 'all .2s'
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* tab: edit */}
                {activeTab === 'edit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <p className="cyber-label">Product Title</p>
                      <input type="text" className="cyber-input"
                        value={generated.title}
                        onChange={e => setGenerated({ ...generated, title: e.target.value })} />
                    </div>
                    <div>
                      <p className="cyber-label">Short Description</p>
                      <textarea className="cyber-input" rows={2}
                        value={generated.description}
                        onChange={e => setGenerated({ ...generated, description: e.target.value })} />
                    </div>
                    <div>
                      <p className="cyber-label">Gumroad Long Description</p>
                      <textarea className="cyber-input" rows={7}
                        value={generated.longDescription}
                        onChange={e => setGenerated({ ...generated, longDescription: e.target.value })} />
                    </div>
                    {generated.faq?.length > 0 && (
                      <div>
                        <p className="cyber-label">FAQ Matrix [{generated.faq.length} nodes]</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {generated.faq.map((item, i) => (
                            <div key={i} style={{
                              padding: '0.6rem 0.8rem',
                              border: '1px solid rgba(0,255,249,0.08)',
                              background: 'rgba(0,255,249,0.02)',
                              display: 'flex', gap: '0.6rem', alignItems: 'flex-start'
                            }}>
                              <span className="font-mono" style={{ color: 'var(--pink)', fontSize: '0.65rem', flexShrink: 0, marginTop: 2 }}>Q{i + 1}</span>
                              <span className="font-mono" style={{ color: 'rgba(184,220,232,0.7)', fontSize: '0.72rem', lineHeight: 1.6 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* tab: guide */}
                {activeTab === 'guide' && (
                  <div>
                    <p className="cyber-label">Step-by-Step Build Guide</p>
                    <div className="cyber-input" style={{ minHeight: 300, maxHeight: 500, overflow: 'auto' }}>
                      <pre className="font-mono" style={{
                        whiteSpace: 'pre-wrap', color: 'var(--green)', fontSize: '0.75rem', lineHeight: 1.85,
                        textShadow: '0 0 8px rgba(0,255,65,0.3)'
                      }}>
                        {generated.stepByStepGuide}
                      </pre>
                    </div>
                  </div>
                )}

                {/* tab: email */}
                {activeTab === 'email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p className="cyber-label">Email Sequence — {generated.emailSequence?.length ?? 0} transmission nodes</p>
                    {(generated.emailSequence ?? []).map((email, i) => (
                      <details key={i} style={{
                        border: '1px solid rgba(0,255,249,0.12)',
                        background: 'rgba(0,255,249,0.02)'
                      }}>
                        <summary style={{
                          padding: '0.7rem 0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'center'
                        }}>
                          <span className="font-mono" style={{ color: 'var(--yellow)', fontSize: '0.65rem' }}>NODE_{String(i + 1).padStart(2, '0')}</span>
                          <span style={{ flex: 1, borderLeft: '1px solid rgba(0,255,249,0.1)', paddingLeft: '0.6rem' }}>
                            <span className="font-mono" style={{ color: 'rgba(0,255,249,0.65)', fontSize: '0.72rem' }}>{email.subject}</span>
                          </span>
                          <span className="font-mono" style={{ color: 'rgba(0,255,249,0.25)', fontSize: '0.6rem' }}>▶</span>
                        </summary>
                        <div style={{ padding: '0.9rem', borderTop: '1px solid rgba(0,255,249,0.08)' }}>
                          <pre className="font-mono" style={{
                            whiteSpace: 'pre-wrap', color: 'rgba(184,220,232,0.75)', fontSize: '0.72rem', lineHeight: 1.75
                          }}>
                            {email.body}
                          </pre>
                        </div>
                      </details>
                    ))}
                  </div>
                )}

                <div className="cyber-hr" />

                {/* publish controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
                  <div style={{ flex: '0 0 auto' }}>
                    <p className="cyber-label">PRICE NODE (USD)</p>
                    <div style={{ position: 'relative', width: 130 }}>
                      <span className="font-title" style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        fontSize: '0.72rem', color: 'var(--yellow)', textShadow: '0 0 8px var(--yellow)'
                      }}>$</span>
                      <input type="number" value={price} min={1} step={1}
                        onChange={e => setPrice(Number(e.target.value))}
                        className="cyber-input font-title"
                        style={{ paddingLeft: '1.6rem', width: 130, color: 'var(--yellow)',
                          textShadow: '0 0 8px var(--yellow)', fontSize: '0.9rem' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button onClick={handlePublish} disabled={loading || published}
                    className="btn-cyber btn-green"
                    style={{ width: 'auto', padding: '0.85rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {loading
                        ? <><div className="spinner spinner-green" /><span>TRANSMITTING...</span></>
                        : published
                          ? <><span style={{ color: 'var(--green)', textShadow: '0 0 8px var(--green)' }}>✓</span><span>DEPLOYED</span></>
                          : <><span>⬆</span><span>DEPLOY TO GUMROAD</span></>
                      }
                    </div>
                  </button>
                </div>

                {published && (
                  <div style={{
                    marginTop: '1rem', padding: '1.25rem',
                    border: '1px solid var(--green)',
                    background: 'rgba(0,255,65,0.04)',
                    boxShadow: '0 0 20px rgba(0,255,65,0.12), inset 0 0 20px rgba(0,255,65,0.04)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem'
                  }}>
                    <p className="font-title glow-green" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
                      ✓ GUMROAD PRODUCT CREATED
                    </p>
                    <a href={pubUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono" style={{ color: 'var(--cyan)', fontSize: '0.75rem',
                        textDecoration: 'underline', textShadow: '0 0 8px var(--cyan)' }}>
                      {pubUrl}
                    </a>
                    <div style={{ borderTop: '1px solid rgba(0,255,65,0.15)', paddingTop: '0.75rem' }}>
                      <p className="font-mono" style={{ color: 'var(--yellow)', fontSize: '0.65rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                        ⚠ ACTION REQUIRED — UPLOAD ZIP TO GUMROAD
                      </p>
                      <p className="font-mono" style={{ color: 'rgba(184,220,232,0.5)', fontSize: '0.62rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Gumroad API doesn't support file upload at creation time. Download the ZIP below and attach it manually:<br/>
                        Gumroad Dashboard → Products → Edit → Content → Upload a file
                      </p>
                      {zipBase64 && (
                        <button
                          onClick={() => {
                            const blob = new Blob(
                              [Uint8Array.from(atob(zipBase64), c => c.charCodeAt(0))],
                              { type: 'application/zip' }
                            )
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'blueprint-product.zip'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="btn-cyber"
                          style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.65rem', borderColor: 'var(--yellow)', color: 'var(--yellow)' }}
                        >
                          <span>⬇ DOWNLOAD PRODUCT ZIP</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* SYSTEM LOG */}
            <div className="cyber-panel panel-accent-cyan" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div className="sweep-light" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem',
                borderBottom: '1px solid rgba(0,255,249,0.1)', paddingBottom: '0.6rem' }}>
                <span className="dot-green" />
                <span className="cyber-tag" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>SYSTEM_LOG</span>
                <span style={{ flex: 1 }} />
                <span className="hex-deco" style={{ fontSize: '0.55rem' }}>{String(logs.length).padStart(3, '0')} lines</span>
              </div>

              <div ref={logRef} style={{ flex: 1, overflowY: 'auto', maxHeight: 340, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {logs.map(log => (
                  <div key={log.id} className="log-entry">
                    <span className="log-timestamp font-mono">{log.ts}</span>
                    <span className="log-text font-mono" style={{ color: logColor(log.type) }}>
                      {log.text}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div className="log-entry">
                    <span className="log-timestamp font-mono">{now()}</span>
                    <span className="font-mono" style={{ color: 'var(--yellow)', fontSize: '0.68rem' }}>
                      ▌
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* STATUS MATRIX */}
            <div className="cyber-panel panel-accent-pink" style={{ padding: '1.25rem' }}>
              <div className="sweep-light" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem',
                borderBottom: '1px solid rgba(0,255,249,0.08)', paddingBottom: '0.6rem' }}>
                <span className="dot-cyan" />
                <span className="cyber-tag" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>STATUS_MATRIX</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {statuses.map(({ label, val, col }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.3rem 0', borderBottom: '1px solid rgba(0,255,249,0.05)' }}>
                    <span className="font-mono" style={{ color: 'rgba(0,255,249,0.4)', fontSize: '0.68rem' }}>{label}</span>
                    <span className="font-mono" style={{ color: col, fontSize: '0.68rem', textShadow: `0 0 8px ${col}`, letterSpacing: '0.05em' }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DATA STREAMS */}
            <div className="cyber-panel" style={{ padding: '1.25rem', overflow: 'hidden' }}>
              <div className="sweep-light" />
              <p className="cyber-label" style={{ marginBottom: '0.75rem', fontSize: '0.6rem' }}>DATA_STREAM</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 1 - i * 0.12 }}>
                    <HexStream len={38} />
                  </div>
                ))}
              </div>
            </div>

            {/* OPERATOR PROTOCOL */}
            <div style={{
              padding: '1.25rem',
              border: '1px solid rgba(0,255,249,0.08)',
              background: 'rgba(0,255,249,0.012)',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(255,0,160,0.3),transparent)' }} />
              <p className="cyber-label" style={{ marginBottom: '0.9rem', fontSize: '0.6rem' }}>OPERATOR_PROTOCOL</p>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {[
                  'Define automation concept above',
                  'Toggle SerpAPI for market intel',
                  'Execute synthesis sequence',
                  'Review & edit all output fields',
                  'Set your price node (default $39)',
                  'Deploy product to Gumroad grid',
                  'Build the real Make.com workflow',
                  'Update product with live template',
                ].map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="font-mono" style={{ color: 'var(--pink)', fontSize: '0.63rem', minWidth: 22, flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-mono" style={{ color: 'rgba(184,220,232,0.38)', fontSize: '0.63rem', lineHeight: 1.5 }}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{
          marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(0,255,249,0.06)', paddingTop: '1rem', opacity: 0.35
        }}>
          <span className="hex-deco">BLUEGUM_STUDIO // {new Date().getFullYear()} // ALL SYSTEMS OPERATIONAL</span>
          <HexStream len={20} />
        </footer>
      </div>
    </div>
  )
}

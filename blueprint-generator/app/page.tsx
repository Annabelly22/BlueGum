'use client'

import { useState, useEffect, useRef } from 'react'

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

const HEX_CHARS = '0123456789ABCDEF'
function randomHex(len: number) {
  return Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('')
}

function HexStream() {
  const [hex, setHex] = useState(randomHex(32))
  useEffect(() => {
    const id = setInterval(() => setHex(randomHex(32)), 120)
    return () => clearInterval(id)
  }, [])
  return <span className="hex-deco select-none">{hex}</span>
}

const BOOT_MSGS = [
  'BLUEGUM_STUDIO.EXE v2.7.1 — initializing...',
  'Loading neural synthesis engine... OK',
  'Connecting to Anthropic API cluster... STANDBY',
  'Gumroad commerce module... READY',
  'SerpAPI market scanner... OPTIONAL',
  'Circuit integrity check... PASSED',
  'All systems nominal. Awaiting operator input.',
]

export default function Home() {
  const [idea, setIdea] = useState('')
  const [useSerp, setUseSerp] = useState(false)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(39)
  const [logLines, setLogLines] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'preview'>('content')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i < BOOT_MSGS.length) {
        setLogLines(prev => [...prev, BOOT_MSGS[i]])
        i++
      } else {
        clearInterval(id)
      }
    }, 220)
    return () => clearInterval(id)
  }, [])

  const addLog = (msg: string) =>
    setLogLines(prev => [...prev.slice(-40), `> ${msg}`])

  const handleGenerate = async () => {
    if (!idea) return
    setLoading(true)
    addLog(`INITIATING synthesis: "${idea.slice(0, 50)}..."`)
    addLog('Dispatching to Claude neural core...')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, useSerp }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGenerated(data)
      addLog('Synthesis complete. Output matrix loaded.')
      addLog(`Title locked: "${data.title}"`)
      setActiveTab('content')
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!generated) return
    setLoading(true)
    addLog('Compiling PDF artifact...')
    addLog('Packaging ZIP bundle...')
    addLog('Transmitting to Gumroad node...')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...generated, price }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPublished(true)
      setPublishedUrl(data.productUrl)
      addLog(`DEPLOY SUCCESS — ${data.productUrl}`)
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen z-10">

      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500,
          background:'radial-gradient(circle, rgba(0,255,249,0.06) 0%, transparent 70%)',
          borderRadius:'50%', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:600, height:600,
          background:'radial-gradient(circle, rgba(255,0,160,0.05) 0%, transparent 70%)',
          borderRadius:'50%', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', top:'40%', left:'40%', width:400, height:400,
          background:'radial-gradient(circle, rgba(0,255,65,0.04) 0%, transparent 70%)',
          borderRadius:'50%', filter:'blur(50px)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="status-dot" />
            <span className="cyber-tag tracking-widest text-xs">
              SYSTEM ONLINE // BLUEGUM_STUDIO v2.7
            </span>
          </div>
          <h1 className="font-orbitron font-black leading-none title-flicker mb-2"
            style={{ fontSize:'clamp(2rem,6vw,3.5rem)', letterSpacing:'-0.02em' }}>
            <span className="glow-cyan">BLUEPRINT</span>
            <span style={{ color:'rgba(0,255,249,0.3)' }}> /</span>
            <span className="glow-pink" style={{ fontSize:'0.62em', marginLeft:'0.2em' }}>GENERATOR</span>
          </h1>
          <p className="font-rajdhani font-light tracking-widest"
            style={{ color:'rgba(200,230,240,0.45)', fontSize:'0.95rem', letterSpacing:'0.3em', textTransform:'uppercase' }}>
            Make.com Automation Blueprint Factory
          </p>
          <div className="flex gap-4 mt-4 overflow-hidden">
            <HexStream /><span className="hex-deco">||</span><HexStream />
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Input + Output */}
          <div className="lg:col-span-2 space-y-5">

            {/* Input Panel */}
            <div className="cyber-panel p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="cyber-label" style={{ opacity:1, fontSize:'0.68rem' }}>
                  AUTOMATION CONCEPT INPUT
                </p>
                <span className="cyber-tag text-xs">MODULE_01</span>
              </div>

              <div className="mb-5">
                <p className="cyber-label">Describe your automation workflow</p>
                <textarea
                  className="cyber-input"
                  rows={5}
                  placeholder="e.g., extract invoices from Gmail → Google Sheets → Slack alert"
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                />
              </div>

              {/* SERP toggle */}
              <div className="flex items-center gap-3 mb-6"
                style={{ cursor:'crosshair' }}
                onClick={() => setUseSerp(!useSerp)}>
                <div style={{
                  width:38, height:20, borderRadius:2, position:'relative',
                  background: useSerp ? 'rgba(0,255,249,0.2)' : 'rgba(0,255,249,0.05)',
                  border:`1px solid ${useSerp ? 'var(--neon-cyan)' : 'rgba(0,255,249,0.2)'}`,
                  boxShadow: useSerp ? '0 0 10px rgba(0,255,249,0.3)' : 'none',
                  transition:'all 0.2s', flexShrink:0
                }}>
                  <div style={{
                    position:'absolute', top:2, left: useSerp ? 18 : 2,
                    width:14, height:14,
                    background: useSerp ? 'var(--neon-cyan)' : 'rgba(0,255,249,0.4)',
                    transition:'left 0.2s',
                    boxShadow: useSerp ? '0 0 8px var(--neon-cyan)' : 'none'
                  }} />
                </div>
                <span className="font-mono-hack text-xs" style={{ color:'rgba(0,255,249,0.55)' }}>
                  SERPAPI_MARKET_SCAN{' '}
                  {useSerp
                    ? <span className="glow-green">ENABLED</span>
                    : <span style={{ color:'rgba(0,255,249,0.3)' }}>DISABLED</span>}
                </span>
              </div>

              <button onClick={handleGenerate} disabled={loading || !idea} className="btn-cyber w-full">
                <span className="flex items-center justify-center gap-3">
                  {loading
                    ? <><div className="spinner" /> SYNTHESIZING DATA...</>
                    : <>⚡ INITIALIZE BLUEPRINT SYNTHESIS</>}
                </span>
              </button>
            </div>

            {/* Output Panel */}
            {generated && (
              <div className="cyber-panel p-6">
                {/* Tabs */}
                <div className="flex gap-0 mb-6 border-b"
                  style={{ borderColor:'rgba(0,255,249,0.12)' }}>
                  {(['content','preview'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{
                        fontFamily:'Orbitron,monospace', fontSize:'0.68rem',
                        padding:'0.5rem 1.25rem', background:'transparent',
                        borderBottom: activeTab === tab ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                        color: activeTab === tab ? 'var(--neon-cyan)' : 'rgba(0,255,249,0.3)',
                        cursor:'crosshair', letterSpacing:'0.15em', textTransform:'uppercase',
                        transition:'all 0.2s'
                      }}>
                      {tab === 'content' ? 'CONTENT EDIT' : 'FULL PREVIEW'}
                    </button>
                  ))}
                </div>

                {activeTab === 'content' && (
                  <div className="space-y-5">
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
                      <textarea className="cyber-input" rows={6}
                        value={generated.longDescription}
                        onChange={e => setGenerated({ ...generated, longDescription: e.target.value })} />
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="space-y-5">
                    <div>
                      <p className="cyber-label">Build Guide</p>
                      <div className="cyber-input overflow-auto" style={{ minHeight:160, maxHeight:280 }}>
                        <pre className="whitespace-pre-wrap font-mono-hack text-xs"
                          style={{ color:'var(--neon-green)', lineHeight:1.8 }}>
                          {generated.stepByStepGuide}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <p className="cyber-label">FAQ Matrix [{generated.faq.length} entries]</p>
                      <div className="cyber-input space-y-2" style={{ maxHeight:220, overflowY:'auto' }}>
                        {generated.faq.map((item, i) => (
                          <div key={i} className="font-mono-hack text-xs pb-2"
                            style={{ borderBottom:'1px solid rgba(0,255,249,0.07)', color:'rgba(200,230,240,0.75)' }}>
                            <span style={{ color:'var(--neon-pink)' }}>Q{i+1} //</span> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    {generated.emailSequence?.length > 0 && (
                      <div>
                        <p className="cyber-label">Email Sequence [{generated.emailSequence.length} nodes]</p>
                        <div className="space-y-2">
                          {generated.emailSequence.map((email, i) => (
                            <details key={i} className="cyber-input">
                              <summary className="font-mono-hack text-xs flex gap-2 items-center"
                                style={{ color:'var(--neon-cyan)', cursor:'crosshair' }}>
                                <span style={{ color:'var(--neon-yellow)' }}>▶ NODE_{i+1}</span>
                                <span style={{ color:'rgba(0,255,249,0.5)' }}>{email.subject}</span>
                              </summary>
                              <div className="mt-3 pt-3 font-mono-hack text-xs"
                                style={{ borderTop:'1px solid rgba(0,255,249,0.1)', color:'rgba(200,230,240,0.7)', lineHeight:1.75 }}>
                                {email.body}
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="cyber-divider" />

                {/* Publish row */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div>
                    <p className="cyber-label">PRICE NODE ($USD)</p>
                    <div style={{ position:'relative' }}>
                      <span className="font-orbitron" style={{
                        position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                        fontSize:'0.75rem', color:'var(--neon-yellow)'
                      }}>$</span>
                      <input type="number" value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        className="cyber-input" min={1} step={1}
                        style={{ width:120, paddingLeft:28, fontFamily:'Orbitron,monospace', color:'var(--neon-yellow)' }} />
                    </div>
                  </div>
                  <div style={{ flex:1 }} />
                  <button onClick={handlePublish} disabled={loading || published}
                    className="btn-cyber btn-publish">
                    <span className="flex items-center gap-2">
                      {loading
                        ? <><div className="spinner" style={{ borderTopColor:'var(--neon-green)' }} /> TRANSMITTING...</>
                        : published ? '✓ DEPLOYED'
                        : '⬆ DEPLOY TO GUMROAD'}
                    </span>
                  </button>
                </div>

                {published && (
                  <div className="mt-4 p-4" style={{
                    border:'1px solid var(--neon-green)', background:'rgba(0,255,65,0.04)',
                    boxShadow:'0 0 20px rgba(0,255,65,0.12)'
                  }}>
                    <p className="font-orbitron text-xs glow-green tracking-widest mb-2">
                      ✓ DEPLOYMENT SUCCESSFUL
                    </p>
                    <a href={publishedUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono-hack text-xs underline" style={{ color:'var(--neon-cyan)' }}>
                      {publishedUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — System panel */}
          <div className="space-y-5">

            {/* System Log */}
            <div className="cyber-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" />
                <span className="cyber-tag text-xs">SYSTEM_LOG</span>
              </div>
              <div className="overflow-y-auto space-y-1" style={{ maxHeight:320 }}>
                {logLines.map((line, i) => (
                  <div key={i} className="font-mono-hack leading-relaxed" style={{
                    fontSize:'0.68rem',
                    color: line.includes('ERROR') ? 'var(--neon-pink)'
                      : line.includes('SUCCESS') || line.includes('complete') ? 'var(--neon-green)'
                      : 'rgba(0,255,249,0.5)'
                  }}>
                    {line}
                  </div>
                ))}
                {loading && (
                  <div className="font-mono-hack text-xs" style={{ color:'var(--neon-yellow)' }}>▌</div>
                )}
              </div>
            </div>

            {/* Status Matrix */}
            <div className="cyber-panel p-4">
              <p className="cyber-label mb-3">STATUS MATRIX</p>
              <div className="space-y-2">
                {[
                  { label:'CLAUDE_API',   status:'CONNECTED', color:'var(--neon-green)' },
                  { label:'GUMROAD',      status:'READY',     color:'var(--neon-cyan)' },
                  { label:'SERPAPI',      status: useSerp ? 'ARMED' : 'STANDBY',
                    color: useSerp ? 'var(--neon-yellow)' : 'rgba(0,255,249,0.3)' },
                  { label:'PDF_ENGINE',   status:'LOADED',    color:'var(--neon-cyan)' },
                  { label:'SYNTHESIS',
                    status: generated ? 'COMPLETE' : loading ? 'RUNNING' : 'IDLE',
                    color:  generated ? 'var(--neon-green)' : loading ? 'var(--neon-yellow)' : 'rgba(0,255,249,0.3)' },
                ].map(({ label, status, color }) => (
                  <div key={label} className="flex justify-between items-center font-mono-hack" style={{ fontSize:'0.7rem' }}>
                    <span style={{ color:'rgba(0,255,249,0.45)' }}>{label}</span>
                    <span style={{ color, textShadow:`0 0 8px ${color}` }}>{status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Stream */}
            <div className="cyber-panel p-4 overflow-hidden" style={{ maxHeight:130 }}>
              <p className="cyber-label mb-2">DATA_STREAM</p>
              <div className="space-y-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
                    <HexStream />
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Protocol */}
            <div className="p-4" style={{
              border:'1px solid rgba(0,255,249,0.1)',
              background:'rgba(0,255,249,0.015)'
            }}>
              <p className="cyber-label mb-3">OPERATOR PROTOCOL</p>
              <ol className="space-y-2">
                {[
                  'Define automation concept',
                  'Toggle SerpAPI for market intel',
                  'Execute synthesis sequence',
                  'Review & edit output fields',
                  'Set your price node',
                  'Deploy to Gumroad grid',
                  'Build the Make.com workflow',
                  'Update product with real template',
                ].map((step, i) => (
                  <li key={i} className="font-mono-hack flex gap-2" style={{ fontSize:'0.68rem', color:'rgba(200,230,240,0.45)' }}>
                    <span style={{ color:'var(--neon-pink)', minWidth:22 }}>{String(i+1).padStart(2,'0')}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 flex items-center justify-between" style={{ opacity:0.4 }}>
          <span className="hex-deco">BLUEGUM_STUDIO // {new Date().getFullYear()} // ALL SYSTEMS OPERATIONAL</span>
          <HexStream />
        </footer>
      </div>
    </div>
  )
}

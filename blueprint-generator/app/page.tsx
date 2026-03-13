'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════
   TYPES
═══════════════════════════════════════ */
type Mode = 'automation' | 'book' | 'template'

interface Product {
  id: string
  title: string
  mode: Mode
  price: number
  suggestedPrice: number
  marketDemand: string
  competitorRange: string
  zipUrl: string
  uploadedAt: string
  status: 'draft' | 'published'
  gumroadUrl?: string
}

interface Generated {
  title: string
  tagline: string
  description: string
  longDescription: string
  targetAudience: string
  suggestedPrice: number
  priceRationale: string
  marketDemand: string
  competitorRange: string
  publishingChecklist: string[]
  faq: string[]
  emailSequence: Array<{ subject: string; body: string }>
  salesCopy: string
  stepByStepGuide?: string
  setupGuide?: string
  fullContent?: string
  customizationGuide?: string
  tableOfContents?: string[]
  featuresIncluded?: string[]
  templateType?: string
  mode: Mode
}

/* ═══════════════════════════════════════
   MODE CONFIG
═══════════════════════════════════════ */
const MODES: Record<Mode, { label: string; icon: string; color: string; placeholder: string }> = {
  automation: {
    label: 'Make.com Blueprint',
    icon: '⚡',
    color: '#00fff9',
    placeholder: 'e.g., Automatically sync new Shopify orders to Google Sheets and send a Slack notification with order summary'
  },
  book: {
    label: 'Ebook / Guide',
    icon: '📘',
    color: '#ff00a0',
    placeholder: 'e.g., The Complete Guide to Building Passive Income with No-Code Tools in 2025'
  },
  template: {
    label: 'Template Pack',
    icon: '🗂',
    color: '#ffe600',
    placeholder: 'e.g., Notion freelance client management system with invoice tracker, project pipeline, and time logging'
  }
}

/* ═══════════════════════════════════════
   STORAGE HELPERS
═══════════════════════════════════════ */
function loadProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem('bluegum_products') || '[]')
  } catch { return [] }
}
function saveProducts(p: Product[]) {
  try { localStorage.setItem('bluegum_products', JSON.stringify(p)) } catch {}
}

/* ═══════════════════════════════════════
   DEMAND BADGE
═══════════════════════════════════════ */
function DemandBadge({ demand }: { demand: string }) {
  const col = demand === 'HIGH' ? '#00ff41' : demand === 'MEDIUM' ? '#ffe600' : '#ff00a0'
  return (
    <span style={{
      padding: '0.2rem 0.6rem',
      border: `1px solid ${col}40`,
      background: `${col}10`,
      color: col,
      fontSize: '0.6rem',
      fontFamily: 'Share Tech Mono, monospace',
      letterSpacing: '0.15em',
      textShadow: `0 0 8px ${col}`
    }}>{demand} DEMAND</span>
  )
}

/* ═══════════════════════════════════════
   MAIN
═══════════════════════════════════════ */
export default function Home() {
  const [view, setView] = useState<'studio' | 'tracker'>('studio')
  const [mode, setMode] = useState<Mode>('automation')
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generated, setGenerated] = useState<Generated | null>(null)
  const [price, setPrice] = useState(27)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'email' | 'checklist'>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [zipResult, setZipResult] = useState<{ zipUrl: string; filename: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const ideaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setProducts(loadProducts()) }, [])
  useEffect(() => { if (generated) setPrice(generated.suggestedPrice) }, [generated])

  /* ── GENERATE ── */
  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) return
    setLoading(true)
    setError('')
    setGenerated(null)
    setZipResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim(), mode }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)
      setGenerated({ ...data, mode })
      setActiveTab('overview')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [idea, mode])

  /* ── UPLOAD & PACKAGE ── */
  const handleUpload = useCallback(async () => {
    if (!generated) return
    setUploading(true)
    setError('')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...generated, price, mode }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)

      setZipResult({ zipUrl: data.zipUrl, filename: data.filename })

      // Save to tracker
      const newProduct: Product = {
        id: Date.now().toString(),
        title: generated.title,
        mode,
        price,
        suggestedPrice: generated.suggestedPrice,
        marketDemand: generated.marketDemand,
        competitorRange: generated.competitorRange,
        zipUrl: data.zipUrl,
        uploadedAt: data.uploadedAt,
        status: 'draft',
      }
      const updated = [newProduct, ...products]
      setProducts(updated)
      saveProducts(updated)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }, [generated, price, mode, products])

  /* ── MARK PUBLISHED ── */
  const markPublished = (id: string, url: string) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, status: 'published' as const, gumroadUrl: url } : p
    )
    setProducts(updated)
    saveProducts(updated)
    setEditingId(null)
  }

  const modeConfig = MODES[mode]

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#010608', color: '#b8dce8', fontFamily: 'Share Tech Mono, monospace' }}>

      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #010608; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,249,0.2); }
        .panel { border: 1px solid rgba(0,255,249,0.1); background: rgba(0,255,249,0.02); padding: 1.5rem; position: relative; }
        .panel::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg,transparent,rgba(0,255,249,0.3),transparent); }
        .inp { width:100%; background: rgba(0,255,249,0.03); border: 1px solid rgba(0,255,249,0.15); color: #b8dce8; font-family: 'Share Tech Mono', monospace; font-size: 0.8rem; padding: 0.7rem 0.9rem; outline: none; resize: vertical; transition: border-color .2s; }
        .inp:focus { border-color: rgba(0,255,249,0.4); }
        .btn { border: none; cursor: pointer; font-family: 'Orbitron', monospace; font-weight: 700; letter-spacing: 0.1em; font-size: 0.7rem; padding: 0.85rem 1.5rem; transition: all .2s; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-cyan { background: rgba(0,255,249,0.1); border: 1px solid rgba(0,255,249,0.3); color: #00fff9; }
        .btn-cyan:hover:not(:disabled) { background: rgba(0,255,249,0.18); box-shadow: 0 0 20px rgba(0,255,249,0.2); }
        .btn-pink { background: rgba(255,0,160,0.1); border: 1px solid rgba(255,0,160,0.3); color: #ff00a0; }
        .btn-pink:hover:not(:disabled) { background: rgba(255,0,160,0.18); box-shadow: 0 0 20px rgba(255,0,160,0.2); }
        .btn-green { background: rgba(0,255,65,0.1); border: 1px solid rgba(0,255,65,0.3); color: #00ff41; }
        .btn-green:hover:not(:disabled) { background: rgba(0,255,65,0.18); box-shadow: 0 0 20px rgba(0,255,65,0.2); }
        .btn-yellow { background: rgba(255,230,0,0.1); border: 1px solid rgba(255,230,0,0.3); color: #ffe600; }
        .btn-yellow:hover:not(:disabled) { background: rgba(255,230,0,0.18); box-shadow: 0 0 20px rgba(255,230,0,0.2); }
        .tab { background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(0,255,249,0.3); font-family: 'Orbitron', monospace; font-size: 0.58rem; letter-spacing: 0.15em; padding: 0.5rem 1rem; cursor: pointer; transition: all .2s; }
        .tab.active { border-bottom-color: #00fff9; color: #00fff9; text-shadow: 0 0 10px #00fff9; }
        .label { font-size: 0.6rem; letter-spacing: 0.2em; color: rgba(0,255,249,0.45); text-transform: uppercase; margin-bottom: 0.4rem; display: block; }
        .mono { font-family: 'Share Tech Mono', monospace; }
        .title-font { font-family: 'Orbitron', monospace; }
        .spinner { width:14px; height:14px; border:2px solid rgba(0,255,249,0.2); border-top-color:#00fff9; border-radius:50%; animation: spin .7s linear infinite; display:inline-block; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .glow-cyan { color:#00fff9; text-shadow: 0 0 20px #00fff9; }
        .glow-pink { color:#ff00a0; text-shadow: 0 0 20px #ff00a0; }
        .glow-yellow { color:#ffe600; text-shadow: 0 0 20px #ffe600; }
        .glow-green { color:#00ff41; text-shadow: 0 0 20px #00ff41; }
        .checklist-item { display:flex; gap:0.75rem; padding:0.6rem 0.8rem; border-left:2px solid rgba(0,255,249,0.2); margin-bottom:0.4rem; background:rgba(0,255,249,0.02); }
        .mode-btn { background:transparent; border:1px solid rgba(0,255,249,0.12); padding:0.75rem 1rem; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:0.6rem; flex:1; }
        .mode-btn.active { border-color:rgba(0,255,249,0.4); background:rgba(0,255,249,0.06); }
        .tracker-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:1rem; padding:0.9rem 1rem; border-bottom:1px solid rgba(0,255,249,0.06); align-items:center; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: '1px solid rgba(0,255,249,0.08)', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span className="title-font glow-cyan" style={{ fontSize: '0.9rem', letterSpacing: '0.15em' }}>BLUEGUM</span>
        <span style={{ color: 'rgba(0,255,249,0.2)', fontSize: '0.7rem' }}>//</span>
        <span className="mono" style={{ color: 'rgba(0,255,249,0.35)', fontSize: '0.65rem' }}>DIGITAL PRODUCT STUDIO</span>
        <div style={{ flex: 1 }} />
        {(['studio', 'tracker'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="btn mono"
            style={{
              padding: '0.4rem 1rem', fontSize: '0.65rem',
              background: view === v ? 'rgba(0,255,249,0.08)' : 'transparent',
              border: `1px solid ${view === v ? 'rgba(0,255,249,0.3)' : 'rgba(0,255,249,0.1)'}`,
              color: view === v ? '#00fff9' : 'rgba(0,255,249,0.4)',
              letterSpacing: '0.15em'
            }}>
            {v === 'studio' ? '⚙ STUDIO' : `📦 PRODUCTS (${products.length})`}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ══════════ STUDIO VIEW ══════════ */}
        {view === 'studio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* ── LEFT: INPUT PANEL ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Mode selector */}
              <div className="panel">
                <span className="label">PRODUCT TYPE</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => { setMode(key); setGenerated(null); setZipResult(null) }}
                      className={`mode-btn ${mode === key ? 'active' : ''}`}
                      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                      <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
                      <span className="mono" style={{ fontSize: '0.58rem', color: mode === key ? cfg.color : 'rgba(0,255,249,0.35)', lineHeight: 1.3 }}>
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Idea input */}
              <div className="panel">
                <span className="label">DESCRIBE YOUR PRODUCT</span>
                <textarea
                  ref={ideaRef}
                  className="inp"
                  rows={5}
                  placeholder={modeConfig.placeholder}
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: '0.58rem', color: 'rgba(0,255,249,0.25)' }}>
                    {idea.length} chars · ⌘↵ to generate
                  </span>
                  <span className="mono" style={{ fontSize: '0.58rem', color: modeConfig.color, opacity: 0.6 }}>
                    {modeConfig.icon} {modeConfig.label}
                  </span>
                </div>

                <button onClick={handleGenerate} disabled={loading || !idea.trim()}
                  className="btn btn-cyan" style={{ width: '100%', marginTop: '1rem' }}>
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span className="spinner" /> GENERATING...
                      </span>
                    : `⚡ GENERATE ${modeConfig.label.toUpperCase()}`}
                </button>
              </div>

              {/* Price + Upload — only show after generation */}
              {generated && (
                <div className="panel">
                  <span className="label">PRICING & PACKAGING</span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="label" style={{ marginBottom: '0.3rem' }}>AI SUGGESTED</span>
                      <div className="title-font glow-yellow" style={{ fontSize: '1.4rem' }}>
                        ${generated.suggestedPrice}
                      </div>
                      <span className="mono" style={{ fontSize: '0.58rem', color: 'rgba(0,255,249,0.3)' }}>
                        {generated.competitorRange} market range
                      </span>
                    </div>
                    <div>
                      <span className="label" style={{ marginBottom: '0.3rem' }}>YOUR PRICE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span className="title-font glow-cyan" style={{ fontSize: '1rem' }}>$</span>
                        <input type="number" value={price} min={1} onChange={e => setPrice(Number(e.target.value))}
                          className="inp title-font"
                          style={{ width: 80, fontSize: '1rem', color: '#00fff9', textShadow: '0 0 8px #00fff9', padding: '0.3rem 0.5rem' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem', background: 'rgba(0,255,249,0.03)', border: '1px solid rgba(0,255,249,0.08)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <DemandBadge demand={generated.marketDemand} />
                    </div>
                    <span className="mono" style={{ fontSize: '0.65rem', color: 'rgba(184,220,232,0.5)', lineHeight: 1.6 }}>
                      {generated.priceRationale}
                    </span>
                  </div>

                  <button onClick={handleUpload} disabled={uploading || !!zipResult}
                    className={`btn ${zipResult ? 'btn-green' : 'btn-pink'}`} style={{ width: '100%' }}>
                    {uploading
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <span className="spinner" style={{ borderTopColor: '#ff00a0' }} /> UPLOADING TO SUPABASE...
                        </span>
                      : zipResult
                        ? '✓ PACKAGED & UPLOADED'
                        : '📦 PACKAGE & UPLOAD TO SUPABASE'}
                  </button>

                  {/* Download + ZIP info */}
                  {zipResult && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <a href={zipResult.zipUrl} download
                        className="btn btn-green mono"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.65rem' }}>
                        ⬇ DOWNLOAD ZIP — for Gumroad upload
                      </a>
                      <span className="mono" style={{ fontSize: '0.58rem', color: 'rgba(0,255,249,0.3)', wordBreak: 'break-all' }}>
                        📁 {zipResult.filename}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ padding: '0.8rem 1rem', border: '1px solid rgba(255,0,160,0.3)', background: 'rgba(255,0,160,0.05)' }}>
                  <span className="mono" style={{ color: '#ff00a0', fontSize: '0.7rem' }}>❌ {error}</span>
                </div>
              )}
            </div>

            {/* ── RIGHT: OUTPUT PANEL ── */}
            <div>
              {!generated && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: '1rem', opacity: 0.3 }}>
                  <span style={{ fontSize: '3rem' }}>{modeConfig.icon}</span>
                  <span className="title-font" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#00fff9' }}>
                    AWAITING INPUT
                  </span>
                  <span className="mono" style={{ fontSize: '0.62rem', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                    Describe your {modeConfig.label} idea and click Generate
                  </span>
                </div>
              )}

              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: '1rem' }}>
                  <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                  <span className="title-font glow-cyan" style={{ fontSize: '0.7rem', letterSpacing: '0.2em' }}>
                    SYNTHESIZING...
                  </span>
                  <span className="mono" style={{ fontSize: '0.62rem', color: 'rgba(0,255,249,0.4)' }}>
                    Claude is writing your complete {modeConfig.label}
                  </span>
                </div>
              )}

              {generated && (
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,255,249,0.08)', background: 'rgba(0,255,249,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h2 className="title-font glow-cyan" style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                          {generated.title}
                        </h2>
                        <p className="mono" style={{ fontSize: '0.72rem', color: 'rgba(184,220,232,0.5)', lineHeight: 1.5 }}>
                          {generated.tagline}
                        </p>
                      </div>
                      <DemandBadge demand={generated.marketDemand} />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,255,249,0.08)', paddingLeft: '0.5rem' }}>
                    {([
                      { key: 'overview', label: 'OVERVIEW' },
                      { key: 'content', label: generated.mode === 'book' ? 'CONTENT' : generated.mode === 'template' ? 'SETUP GUIDE' : 'BUILD GUIDE' },
                      { key: 'email', label: `EMAILS (${generated.emailSequence?.length ?? 0})` },
                      { key: 'checklist', label: '📋 PUBLISH STEPS' },
                    ] as const).map(t => (
                      <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`tab ${activeTab === t.key ? 'active' : ''}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div style={{ padding: '1.5rem', maxHeight: 600, overflowY: 'auto' }}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <span className="label">TARGET AUDIENCE</span>
                            <p className="mono" style={{ fontSize: '0.72rem', lineHeight: 1.6, color: 'rgba(184,220,232,0.7)' }}>
                              {generated.targetAudience}
                            </p>
                          </div>
                          <div>
                            <span className="label">MARKET</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <span className="mono" style={{ fontSize: '0.7rem', color: 'rgba(184,220,232,0.5)' }}>
                                Comp range: {generated.competitorRange}
                              </span>
                              <DemandBadge demand={generated.marketDemand} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="label">SHORT DESCRIPTION</span>
                          <p className="mono" style={{ fontSize: '0.75rem', lineHeight: 1.7, color: 'rgba(184,220,232,0.75)' }}>
                            {generated.description}
                          </p>
                        </div>

                        <div>
                          <span className="label">GUMROAD LONG DESCRIPTION</span>
                          <div style={{ background: 'rgba(0,255,249,0.02)', border: '1px solid rgba(0,255,249,0.08)', padding: '1rem', maxHeight: 200, overflowY: 'auto' }}>
                            <p className="mono" style={{ fontSize: '0.72rem', lineHeight: 1.7, color: 'rgba(184,220,232,0.7)', whiteSpace: 'pre-wrap' }}>
                              {generated.longDescription}
                            </p>
                          </div>
                        </div>

                        {generated.tableOfContents && (
                          <div>
                            <span className="label">TABLE OF CONTENTS</span>
                            {generated.tableOfContents.map((ch, i) => (
                              <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(0,255,249,0.05)' }}>
                                <span className="mono" style={{ color: '#ff00a0', fontSize: '0.65rem', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                                <span className="mono" style={{ color: 'rgba(184,220,232,0.6)', fontSize: '0.7rem' }}>{ch}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {generated.featuresIncluded && (
                          <div>
                            <span className="label">FEATURES INCLUDED</span>
                            {generated.featuresIncluded.map((f, i) => (
                              <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0' }}>
                                <span className="mono" style={{ color: '#00ff41', fontSize: '0.65rem' }}>✓</span>
                                <span className="mono" style={{ color: 'rgba(184,220,232,0.65)', fontSize: '0.7rem' }}>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <span className="label">SALES COPY</span>
                          <div style={{ background: 'rgba(255,0,160,0.03)', border: '1px solid rgba(255,0,160,0.1)', padding: '1rem' }}>
                            <p className="mono" style={{ fontSize: '0.72rem', lineHeight: 1.7, color: 'rgba(184,220,232,0.7)', whiteSpace: 'pre-wrap' }}>
                              {generated.salesCopy}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="label">FAQ ({generated.faq?.length ?? 0})</span>
                          {(generated.faq ?? []).map((item, i) => (
                            <div key={i} style={{ padding: '0.5rem 0.75rem', marginBottom: '0.4rem', background: 'rgba(0,255,249,0.02)', border: '1px solid rgba(0,255,249,0.06)' }}>
                              <span className="mono" style={{ fontSize: '0.68rem', lineHeight: 1.6, color: 'rgba(184,220,232,0.65)' }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONTENT / GUIDE */}
                    {activeTab === 'content' && (
                      <div>
                        <span className="label" style={{ marginBottom: '0.75rem' }}>
                          {generated.mode === 'book' ? 'FULL EBOOK CONTENT' : generated.mode === 'template' ? 'SETUP GUIDE' : 'MAKE.COM BUILD GUIDE'}
                        </span>
                        <pre className="mono" style={{
                          whiteSpace: 'pre-wrap', fontSize: '0.72rem', lineHeight: 1.85,
                          color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.2)'
                        }}>
                          {generated.stepByStepGuide || generated.setupGuide || generated.fullContent || generated.customizationGuide || 'No content generated'}
                        </pre>
                      </div>
                    )}

                    {/* EMAIL SEQUENCE */}
                    {activeTab === 'email' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(generated.emailSequence ?? []).map((email, i) => (
                          <details key={i} style={{ border: '1px solid rgba(0,255,249,0.1)', background: 'rgba(0,255,249,0.02)' }}>
                            <summary style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <span className="mono" style={{ color: '#ffe600', fontSize: '0.62rem', flexShrink: 0 }}>EMAIL {i + 1}</span>
                              <span className="mono" style={{ color: 'rgba(0,255,249,0.65)', fontSize: '0.72rem' }}>{email.subject}</span>
                            </summary>
                            <div style={{ padding: '1rem', borderTop: '1px solid rgba(0,255,249,0.08)' }}>
                              <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem', lineHeight: 1.75, color: 'rgba(184,220,232,0.7)' }}>
                                {email.body}
                              </pre>
                            </div>
                          </details>
                        ))}
                      </div>
                    )}

                    {/* PUBLISHING CHECKLIST */}
                    {activeTab === 'checklist' && (
                      <div>
                        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)' }}>
                          <span className="mono" style={{ fontSize: '0.68rem', color: '#00ff41', lineHeight: 1.6 }}>
                            ✓ Your ZIP is ready to upload. Follow these steps to publish on Gumroad.
                          </span>
                        </div>
                        {(generated.publishingChecklist ?? []).map((step, i) => (
                          <div key={i} className="checklist-item">
                            <span className="mono title-font" style={{ color: '#00fff9', fontSize: '0.65rem', flexShrink: 0, minWidth: 24 }}>
                              {String(i + 1).padStart(2, '0')}.
                            </span>
                            <span className="mono" style={{ fontSize: '0.72rem', lineHeight: 1.6, color: 'rgba(184,220,232,0.7)' }}>
                              {step}
                            </span>
                          </div>
                        ))}
                        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid rgba(255,230,0,0.2)', background: 'rgba(255,230,0,0.03)' }}>
                          <span className="label" style={{ color: '#ffe600', marginBottom: '0.5rem' }}>AFTER PUBLISHING</span>
                          <p className="mono" style={{ fontSize: '0.68rem', lineHeight: 1.6, color: 'rgba(255,230,0,0.6)' }}>
                            Copy your Gumroad product URL → go to Products tracker (top right) → mark as Published and paste the URL to track it.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ TRACKER VIEW ══════════ */}
        {view === 'tracker' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="title-font glow-cyan" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>PRODUCT TRACKER</h2>
                <span className="mono" style={{ fontSize: '0.65rem', color: 'rgba(0,255,249,0.35)' }}>
                  {products.length} products · {products.filter(p => p.status === 'published').length} published
                </span>
              </div>
              <button onClick={() => setView('studio')} className="btn btn-cyan">+ NEW PRODUCT</button>
            </div>

            {products.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <span className="mono" style={{ color: 'rgba(0,255,249,0.3)', fontSize: '0.75rem' }}>
                  No products yet. Generate and package your first product in the Studio.
                </span>
              </div>
            ) : (
              <div className="panel" style={{ padding: 0 }}>
                {/* Header */}
                <div className="tracker-row" style={{ borderBottom: '1px solid rgba(0,255,249,0.15)', background: 'rgba(0,255,249,0.04)' }}>
                  {['PRODUCT', 'TYPE', 'PRICE', 'DEMAND', 'STATUS'].map(h => (
                    <span key={h} className="label" style={{ marginBottom: 0 }}>{h}</span>
                  ))}
                </div>

                {products.map(p => (
                  <div key={p.id}>
                    <div className="tracker-row">
                      <div>
                        <span className="mono" style={{ fontSize: '0.75rem', color: 'rgba(184,220,232,0.85)', display: 'block' }}>{p.title}</span>
                        <span className="mono" style={{ fontSize: '0.58rem', color: 'rgba(0,255,249,0.3)' }}>
                          {new Date(p.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.9rem' }}>{MODES[p.mode].icon}</span>
                      <div>
                        <span className="title-font glow-yellow" style={{ fontSize: '0.9rem' }}>${p.price}</span>
                        {p.price !== p.suggestedPrice && (
                          <span className="mono" style={{ fontSize: '0.58rem', color: 'rgba(0,255,249,0.3)', display: 'block' }}>
                            AI: ${p.suggestedPrice}
                          </span>
                        )}
                      </div>
                      <DemandBadge demand={p.marketDemand} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {p.status === 'published' ? (
                          <div>
                            <span className="mono glow-green" style={{ fontSize: '0.65rem', display: 'block' }}>✓ PUBLISHED</span>
                            {p.gumroadUrl && (
                              <a href={p.gumroadUrl} target="_blank" rel="noopener noreferrer"
                                className="mono" style={{ fontSize: '0.58rem', color: '#00fff9', textDecoration: 'underline' }}>
                                View →
                              </a>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <a href={p.zipUrl} download className="btn btn-cyan mono"
                              style={{ fontSize: '0.58rem', padding: '0.3rem 0.6rem', textDecoration: 'none', textAlign: 'center' }}>
                              ⬇ ZIP
                            </a>
                            <button onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                              className="btn btn-green mono"
                              style={{ fontSize: '0.58rem', padding: '0.3rem 0.6rem' }}>
                              ✓ Mark Live
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mark published inline form */}
                    {editingId === p.id && (
                      <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,255,65,0.04)', borderBottom: '1px solid rgba(0,255,65,0.12)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                          className="inp mono"
                          style={{ flex: 1, padding: '0.4rem 0.7rem', fontSize: '0.7rem' }}
                          placeholder="Paste Gumroad product URL (optional)"
                          id={`url-${p.id}`}
                        />
                        <button onClick={() => {
                          const el = document.getElementById(`url-${p.id}`) as HTMLInputElement
                          markPublished(p.id, el?.value || '')
                        }} className="btn btn-green" style={{ padding: '0.4rem 1rem', fontSize: '0.65rem' }}>
                          SAVE
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

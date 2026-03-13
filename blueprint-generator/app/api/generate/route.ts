import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
const client = new Anthropic()

type Mode = 'automation' | 'book' | 'template'

function buildPrompt(mode: Mode, idea: string): string {
  const base = `You are an expert digital product creator for Gumroad.
The user wants to create a "${mode}" product about: "${idea}"

Analyze the market demand, typical pricing, and content depth needed.
Return ONLY valid JSON — no markdown, no code fences, no extra text.`

  if (mode === 'automation') return `${base}
{
  "title": "Make.com blueprint product title (under 60 chars)",
  "tagline": "One punchy value proposition sentence",
  "description": "2-3 sentence Gumroad short description",
  "longDescription": "Full Gumroad description 250-300 words — pain points, ROI, what's included",
  "targetAudience": "Exact persona this is for in 1-2 sentences",
  "stepByStepGuide": "Complete numbered Make.com build guide — trigger setup, each module with exact settings, filters, error handling, testing. Minimum 10 detailed steps.",
  "faq": ["Q: ...? A: ...", "Q: ...? A: ...", "Q: ...? A: ...", "Q: ...? A: ...", "Q: ...? A: ..."],
  "emailSequence": [
    { "subject": "...", "body": "Welcome — what they got, quick start" },
    { "subject": "...", "body": "Day 3 — troubleshooting, common questions" },
    { "subject": "...", "body": "Upsell — related automations" }
  ],
  "salesCopy": "Strong headline + 5 bullet benefits + CTA",
  "suggestedPrice": 27,
  "priceRationale": "2-3 sentence price reasoning based on complexity, time saved, market positioning",
  "marketDemand": "HIGH | MEDIUM | LOW",
  "competitorRange": "$X - $Y",
  "publishingChecklist": [
    "Go to gumroad.com → Products → New Product → Digital",
    "Paste the title and short description",
    "Copy the long description into the product page editor",
    "Set price to $X (or your preferred amount)",
    "Upload the ZIP file downloaded from BlueGum",
    "Add tags: make.com, automation, no-code, [niche]",
    "Set thumbnail (use Canva — 1280x720px recommended)",
    "Toggle Published → ON",
    "Copy product URL and share"
  ]
}`

  if (mode === 'book') return `${base}
{
  "title": "Ebook/guide title (under 60 chars)",
  "tagline": "Transformation subtitle",
  "description": "2-3 sentence book pitch",
  "longDescription": "Full Gumroad description 250-300 words — reader transformation, chapters overview, who it's for",
  "targetAudience": "Specific reader persona in 1-2 sentences",
  "tableOfContents": ["Introduction: ...", "Chapter 1: ...", "Chapter 2: ...", "Chapter 3: ...", "Chapter 4: ...", "Chapter 5: ...", "Chapter 6: ...", "Conclusion: ..."],
  "fullContent": "Write the COMPLETE ebook content — introduction + all chapters fully written. Minimum 2000 words. Use markdown headings, bullet points, and practical examples throughout.",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4", "Takeaway 5"],
  "faq": ["Q: ...? A: ...", "Q: ...? A: ...", "Q: ...? A: ..."],
  "emailSequence": [
    { "subject": "...", "body": "Delivery email — reading tips, best chapter to start" },
    { "subject": "...", "body": "Day 3 — highlight most valuable section" },
    { "subject": "...", "body": "Review request + upsell" }
  ],
  "salesCopy": "Headline + 5 transformation bullets + urgency CTA",
  "suggestedPrice": 17,
  "priceRationale": "Price reasoning based on page count, topic demand, market comparison",
  "marketDemand": "HIGH | MEDIUM | LOW",
  "competitorRange": "$X - $Y",
  "publishingChecklist": [
    "Go to gumroad.com → Products → New Product → Digital",
    "Paste title and short description",
    "Copy long description into editor",
    "Set price to $X",
    "Upload the PDF/ZIP downloaded from BlueGum",
    "Add tags: ebook, guide, [niche topic]",
    "Set cover image (book mockup — Canva template recommended)",
    "Toggle Published → ON",
    "Share product URL"
  ]
}`

  // template
  return `${base}
{
  "title": "Template product title (under 60 chars)",
  "tagline": "What this template lets you do immediately",
  "description": "2-3 sentence template pitch",
  "longDescription": "Full Gumroad description 250-300 words — what's included, time saved, integrations, who benefits",
  "targetAudience": "Who uses this and why in 1-2 sentences",
  "templateType": "Notion | Google Sheets | Airtable | Excel | Canva",
  "featuresIncluded": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6"],
  "setupGuide": "Complete numbered setup guide — how to copy/duplicate, customize fields, populate data, connect integrations. Minimum 8 detailed steps.",
  "customizationGuide": "How to adapt the template for different use cases — 150-200 words",
  "faq": ["Q: ...? A: ...", "Q: ...? A: ...", "Q: ...? A: ...", "Q: ...? A: ..."],
  "emailSequence": [
    { "subject": "...", "body": "Setup instructions + first action to take" },
    { "subject": "...", "body": "Pro tips and advanced features" },
    { "subject": "...", "body": "Check-in + upsell to related template pack" }
  ],
  "salesCopy": "Headline + 5 benefit bullets + social proof placeholder + CTA",
  "suggestedPrice": 19,
  "priceRationale": "Price reasoning based on complexity, time saved, market comp",
  "marketDemand": "HIGH | MEDIUM | LOW",
  "competitorRange": "$X - $Y",
  "publishingChecklist": [
    "Go to gumroad.com → Products → New Product → Digital",
    "Paste title and short description",
    "Copy long description into editor",
    "Set price to $X",
    "Upload ZIP downloaded from BlueGum",
    "Add tags: template, notion, productivity, [niche]",
    "Set thumbnail (screenshot of template — 1280x720px)",
    "Toggle Published → ON",
    "Share product URL"
  ]
}`
}

export async function POST(req: NextRequest) {
  try {
    const { idea, mode = 'automation' } = await req.json()
    if (!idea) return NextResponse.json({ error: 'idea is required' }, { status: 400 })

    const prompt = buildPrompt(mode as Mode, idea)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    if (message.content[0].type !== 'text') throw new Error('Unexpected response type')

    const raw = message.content[0].text.trim()
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json({ ...parsed, mode })
    } catch (e) {
      throw new Error(`JSON parse failed: ${(e as Error).message}\n\nRaw: ${raw.slice(0, 300)}`)
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET() {
  const results: Record<string, unknown> = {}
  try {
    await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 10, messages: [{ role: 'user', content: 'hi' }] })
    results.anthropic = 'OK'
  } catch (e) { results.anthropic = `FAIL: ${(e as Error).message}` }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
    const { data } = await sb.storage.getBucket('blueprints')
    results.supabase = data ? `OK — blueprints public=${data.public}` : 'FAIL: bucket not found'
  } catch (e) { results.supabase = `FAIL: ${(e as Error).message}` }

  results.env = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
  }

  return NextResponse.json(results)
}

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const client = new Anthropic()

// POST — generate blueprint content (frontend sends `idea`)
export async function POST(req: NextRequest) {
  try {
    const { idea, useSerp } = await req.json()

    if (!idea) {
      return NextResponse.json({ error: 'idea is required' }, { status: 400 })
    }

    // Optional: SerpAPI market research
    let searchContext = ''
    if (useSerp && process.env.SERPAPI_KEY) {
      try {
        const serpRes = await fetch(
          `https://serpapi.com/search.json?q=${encodeURIComponent(idea + ' automation')}&api_key=${process.env.SERPAPI_KEY}&num=5`
        )
        const serpData = await serpRes.json()
        const results = serpData.organic_results?.slice(0, 5) ?? []
        searchContext = results.map((r: { title: string; snippet: string }) =>
          `- ${r.title}: ${r.snippet}`
        ).join('\n')
      } catch {
        // SerpAPI optional — ignore failures
      }
    }

    const prompt = `You are an expert in no-code automation and digital product creation.
A user wants to create a Make.com automation blueprint product for: "${idea}".
${searchContext ? `\nMarket research context:\n${searchContext}\n` : ''}
Return ONLY a valid JSON object — no markdown, no code fences, no explanation text.
The JSON must exactly match this structure:
{
  "title": "Catchy product title under 60 chars",
  "description": "2-3 sentence compelling short description",
  "longDescription": "Detailed Gumroad product description, 200-300 words",
  "stepByStepGuide": "Numbered step-by-step guide to build this Make.com workflow, including which modules to use, trigger setup, filters, error handling, and testing tips. At least 8 steps.",
  "faq": [
    "Q: Question one? A: Answer one.",
    "Q: Question two? A: Answer two.",
    "Q: Question three? A: Answer three.",
    "Q: Question four? A: Answer four.",
    "Q: Question five? A: Answer five."
  ],
  "emailSequence": [
    { "subject": "Welcome email subject", "body": "Welcome email body" },
    { "subject": "Follow-up email subject", "body": "Follow-up email body" },
    { "subject": "Upsell email subject", "body": "Upsell email body" }
  ],
  "salesCopy": "Sales headline + 5 bullet points"
}
CRITICAL: Output ONLY the JSON object. Do not wrap in markdown. Do not add any text before or after.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    if (message.content[0].type !== 'text') {
      throw new Error('Unexpected response type from Claude API')
    }

    const raw = message.content[0].text.trim()
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch (parseErr) {
      throw new Error(`Failed to parse Claude response as JSON: ${(parseErr as Error).message}`)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — full diagnostic
export async function GET() {
  const results: Record<string, unknown> = {}

  // Anthropic
  try {
    const client = new Anthropic()
    await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hi' }],
    })
    results.anthropic = 'OK'
  } catch (e) {
    results.anthropic = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Gumroad GET user
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const res = await fetch(`https://api.gumroad.com/v2/user?access_token=${token}`)
    const json = await res.json()
    results.gumroad_user = json.success ? `OK — ${json.user.email}` : `FAIL: ${json.message}`
  } catch (e) {
    results.gumroad_user = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Gumroad GET product wxeyzln
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const res = await fetch(`https://api.gumroad.com/v2/products/wxeyzln?access_token=${token}`)
    const text = await res.text()
    if (text.trim().startsWith('<')) {
      results.gumroad_product_get = { FAIL: true, httpStatus: res.status, message: 'Got HTML — product ID may be wrong' }
    } else {
      const json = JSON.parse(text)
      results.gumroad_product_get = json.success ? `OK — "${json.product.name}"` : `FAIL: ${json.message}`
    }
  } catch (e) {
    results.gumroad_product_get = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Gumroad PUT test
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const body = new URLSearchParams()
    body.append('name', 'BlueGum Blueprint [API Test]')
    const res = await fetch(`https://api.gumroad.com/v2/products/wxeyzln?access_token=${token}`, {
      method: 'PUT', body,
    })
    const text = await res.text()
    if (text.trim().startsWith('<')) {
      results.gumroad_put_test = { FAIL: true, httpStatus: res.status, message: 'Got HTML — PUT also blocked' }
    } else {
      const json = JSON.parse(text)
      results.gumroad_put_test = json.success ? `OK — updated to "${json.product.name}"` : `FAIL: ${json.message}`
    }
  } catch (e) {
    results.gumroad_put_test = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Lemon Squeezy
  try {
    const key = process.env.LEMONSQUEEZY_API_KEY
    if (!key) {
      results.lemonsqueezy = 'SKIP — LEMONSQUEEZY_API_KEY not set'
    } else {
      const res = await fetch('https://api.lemonsqueezy.com/v1/stores', {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/vnd.api+json' },
      })
      const json = await res.json()
      results.lemonsqueezy = json.data ? `OK — ${json.data.length} store(s)` : `FAIL: ${JSON.stringify(json.errors)}`
    }
  } catch (e) {
    results.lemonsqueezy = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
    const { data } = await supabase.storage.getBucket('blueprints')
    results.supabase = data ? `OK — blueprints public=${data.public}` : 'FAIL: bucket not found'
  } catch (e) {
    results.supabase = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  results.env_check = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GUMROAD_TOKEN_PREVIEW: process.env.GUMROAD_ACCESS_TOKEN?.slice(0, 12) + '...',
    LEMONSQUEEZY_API_KEY: !!process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID || 'NOT SET',
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
  }

  return NextResponse.json(results)
}

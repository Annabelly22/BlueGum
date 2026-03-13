import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const client = new Anthropic()

// POST — generate blueprint content
export async function POST(req: NextRequest) {
  try {
    const { topic, searchResults } = await req.json()

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    const searchContext = searchResults?.length
      ? `\n\nSearch context:\n${searchResults.map((r: { title: string; snippet: string }) => `- ${r.title}: ${r.snippet}`).join('\n')}`
      : ''

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a Make.com automation expert. Generate a blueprint guide for: "${topic}"${searchContext}

Respond with JSON only (no markdown):
{
  "title": "Short product title (under 60 chars)",
  "summary": "2-3 sentence description of what this blueprint does",
  "sections": ["key feature 1", "key feature 2", "key feature 3", "key feature 4", "key feature 5"],
  "setupGuide": "Step-by-step markdown setup guide (500-800 words)",
  "templateUrl": "https://make.com/templates (placeholder)",
  "faq": [
    {"q": "question 1", "a": "answer 1"},
    {"q": "question 2", "a": "answer 2"},
    {"q": "question 3", "a": "answer 3"}
  ]
}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ success: true, content: parsed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — diagnostic: test all API connections including Gumroad PUT update
export async function GET() {
  const results: Record<string, unknown> = {}

  // Test Anthropic
  try {
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hi' }],
    })
    results.anthropic = 'OK'
  } catch (e) {
    results.anthropic = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test Gumroad GET user
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const res = await fetch(`https://api.gumroad.com/v2/user?access_token=${token}`)
    const json = await res.json()
    results.gumroad_user = json.success
      ? `OK — ${json.user.email}`
      : `FAIL: ${json.message}`
  } catch (e) {
    results.gumroad_user = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test Gumroad GET product (verify wxeyzln exists)
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const res = await fetch(`https://api.gumroad.com/v2/products/wxeyzln?access_token=${token}`)
    const text = await res.text()
    if (text.trim().startsWith('<')) {
      results.gumroad_product_get = { FAIL: true, httpStatus: res.status, isHtml: true, message: 'Got HTML back — product ID may be wrong' }
    } else {
      const json = JSON.parse(text)
      results.gumroad_product_get = json.success
        ? `OK — product: "${json.product.name}"`
        : `FAIL: ${json.message}`
    }
  } catch (e) {
    results.gumroad_product_get = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test Gumroad PUT update (the real test)
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const body = new URLSearchParams()
    body.append('name', 'BlueGum Blueprint [API Test]')

    const res = await fetch(
      `https://api.gumroad.com/v2/products/wxeyzln?access_token=${token}`,
      { method: 'PUT', body }
    )
    const text = await res.text()
    if (text.trim().startsWith('<')) {
      results.gumroad_put_test = {
        FAIL: true,
        httpStatus: res.status,
        isHtml: true,
        message: `Got HTML — PUT /products/:id also blocked`,
      }
    } else {
      const json = JSON.parse(text)
      results.gumroad_put_test = json.success
        ? `OK — updated product name to "${json.product.name}"`
        : `FAIL: ${json.message}`
    }
  } catch (e) {
    results.gumroad_put_test = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    const { data } = await supabase.storage.getBucket('blueprints')
    results.supabase = data
      ? `OK — blueprints public=${data.public}`
      : 'FAIL: bucket not found'
  } catch (e) {
    results.supabase = `FAIL: ${e instanceof Error ? e.message : String(e)}`
  }

  // Env check
  results.env_check = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GUMROAD_TOKEN_PREVIEW: process.env.GUMROAD_ACCESS_TOKEN?.slice(0, 12) + '...',
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
  }

  return NextResponse.json(results)
}

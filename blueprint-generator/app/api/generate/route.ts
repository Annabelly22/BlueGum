import { NextResponse } from 'next/server'
import { generateProductContent } from '@/lib/claude'
import { checkDemand } from '@/lib/serp'
import axios from 'axios'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { idea, useSerp } = await req.json()
    if (!idea) return NextResponse.json({ error: 'Idea is required' }, { status: 400 })
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 })
    }
    let demandData = null
    if (useSerp && process.env.SERPAPI_KEY) {
      demandData = await checkDemand(`${idea} automation`)
    }
    const content = await generateProductContent(idea)
    return NextResponse.json({ ...content, demandData })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}

export async function GET() {
  const results: Record<string, any> = {}
  const token = process.env.GUMROAD_ACCESS_TOKEN ?? ''

  // ── Anthropic ──
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] })
    results.anthropic = 'OK'
  } catch (e: any) { results.anthropic = 'FAIL: ' + e.message }

  // ── Gumroad GET user ──
  try {
    const res = await axios.get(`https://api.gumroad.com/v2/user?access_token=${token}`)
    results.gumroad_user = 'OK — ' + res.data?.user?.email
  } catch (e: any) { results.gumroad_user = 'FAIL: ' + (e?.response?.status || e.message) }

  // ── Gumroad POST products (raw test) ──
  try {
    const params = new URLSearchParams()
    params.append('name', 'TEST PRODUCT DELETE ME')
    params.append('price', '0')
    const res = await axios.post(
      `https://api.gumroad.com/v2/products?access_token=${token}`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    results.gumroad_post_test = {
      httpStatus: res.status,
      body: res.data
    }
  } catch (e: any) {
    results.gumroad_post_test = {
      FAIL: true,
      httpStatus: e?.response?.status,
      responseBody: e?.response?.data,
      message: e?.message,
      isHtml: typeof e?.response?.data === 'string' && e?.response?.data?.includes('<!DOCTYPE')
    }
  }

  // ── Supabase ──
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
    const { data, error } = await sb.storage.listBuckets()
    if (error) throw new Error(error.message)
    const bucket = data?.find((b: any) => b.name === 'blueprints')
    results.supabase = bucket ? `OK — blueprints public=${bucket.public}` : 'FAIL — bucket not found'
  } catch (e: any) { results.supabase = 'FAIL: ' + e.message }

  results.env_check = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GUMROAD_TOKEN_PREVIEW: token ? token.slice(0, 12) + '...' : 'NOT SET',
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
  }

  return NextResponse.json(results, { status: 200 })
}

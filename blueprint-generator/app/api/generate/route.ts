import { NextResponse } from 'next/server'
import { generateProductContent } from '@/lib/claude'
import { checkDemand } from '@/lib/serp'

export async function POST(req: Request) {
  try {
    const { idea, useSerp } = await req.json()

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 })
    }

    // Optional market research
    let demandData = null
    if (useSerp && process.env.SERPAPI_KEY) {
      demandData = await checkDemand(`${idea} automation`)
    }

    const content = await generateProductContent(idea)

    return NextResponse.json({ ...content, demandData })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function GET() {
  const results: Record<string, any> = {}

  // Anthropic
  try {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('not set')
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: key })
    await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] })
    results.anthropic = 'OK'
  } catch (e: any) { results.anthropic = 'FAIL: ' + e.message }

  // Gumroad bearer
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    if (!token) throw new Error('not set')
    const { default: axios } = await import('axios')
    const res = await axios.get('https://api.gumroad.com/v2/user', { headers: { Authorization: `Bearer ${token}` } })
    results.gumroad_bearer = 'OK — ' + res.data?.user?.email
  } catch (e: any) { results.gumroad_bearer = 'FAIL: ' + (e?.response?.status || e.message) }

  // Gumroad query param
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN
    const { default: axios } = await import('axios')
    const res = await axios.get(`https://api.gumroad.com/v2/user?access_token=${token}`)
    results.gumroad_queryparam = 'OK — ' + res.data?.user?.email
  } catch (e: any) { results.gumroad_queryparam = 'FAIL: ' + (e?.response?.status || e.message) }

  // Supabase
  try {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) throw new Error('env vars not set')
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key)
    const { data, error } = await sb.storage.listBuckets()
    if (error) throw new Error(error.message)
    const bucket = data?.find((b: any) => b.name === 'blueprints')
    results.supabase = bucket ? `OK — blueprints bucket found, public=${bucket.public}` : 'FAIL — blueprints bucket not found. Buckets: ' + data?.map((b:any) => b.name).join(', ')
  } catch (e: any) { results.supabase = 'FAIL: ' + e.message }

  results.env_check = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GUMROAD_ACCESS_TOKEN: process.env.GUMROAD_ACCESS_TOKEN ? process.env.GUMROAD_ACCESS_TOKEN.slice(0,12)+'...' : 'NOT SET',
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
  }

  return NextResponse.json(results)
}
```

Make sure `NextResponse` is already imported at the top (it is). Then just visit:
```
https://your-vercel-domain.vercel.app/api/generate

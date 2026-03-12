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

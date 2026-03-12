import { NextResponse } from 'next/server'
import { createProduct } from '@/lib/gumroad'
import { generateGuideMarkdown, createProductZip } from '@/lib/file-generator'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let step = 'parsing request'
  try {
    const body = await req.json()
    const { title, description, longDescription, stepByStepGuide, faq, emailSequence, salesCopy, price } = body

    if (!process.env.GUMROAD_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'GUMROAD_ACCESS_TOKEN is not set. Add it in Vercel → Settings → Environment Variables.' },
        { status: 500 }
      )
    }

    step = 'generating markdown guide'
    const guideMarkdown = generateGuideMarkdown(
      title,
      stepByStepGuide,
      faq ?? [],
      emailSequence ?? [],
      salesCopy ?? ''
    )

    step = 'creating ZIP bundle'
    const templateLink = 'https://make.com/templates/your-template-id — replace this after building your workflow'
    const zipBuffer = await createProductZip(guideMarkdown, templateLink, faq ?? [])

    step = 'creating Gumroad product'
    const product = await createProduct({
      name: title,
      description: longDescription || description,
      price: Math.round(price * 100),
      file: zipBuffer,
      custom_permalink: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
    })

    return NextResponse.json({ productUrl: product.short_url || product.url || 'https://gumroad.com/dashboard' })

  } catch (error: any) {
    console.error(`Publish failed at step [${step}]:`, error)

    // Pull the most useful message out of axios errors too
    const axiosMsg = error?.response?.data
      ? JSON.stringify(error.response.data)
      : null
    const message = axiosMsg || error?.message || String(error)

    return NextResponse.json(
      { error: `Failed at [${step}]: ${message}` },
      { status: 500 }
    )
  }
}

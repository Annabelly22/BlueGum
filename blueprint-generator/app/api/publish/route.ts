import { NextResponse } from 'next/server'
import { createProduct } from '@/lib/gumroad'
import { generateGuideMarkdown, createProductZip } from '@/lib/file-generator'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let step = 'parsing request'
  try {
    const body = await req.json()
    const {
      title, description, longDescription,
      stepByStepGuide, faq, emailSequence, salesCopy, price,
    } = body

    if (!process.env.GUMROAD_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'GUMROAD_ACCESS_TOKEN not set. Add it in Vercel → Settings → Environment Variables.' },
        { status: 500 }
      )
    }

    step = 'generating guide markdown'
    const guideMarkdown = generateGuideMarkdown(
      title,
      stepByStepGuide,
      faq ?? [],
      emailSequence ?? [],
      salesCopy ?? ''
    )

    step = 'creating ZIP bundle'
    const templateLink = 'https://make.com/templates/your-template-id — replace after building'
    const zipBuffer = await createProductZip(guideMarkdown, templateLink, faq ?? [])
    const zipBase64 = zipBuffer.toString('base64')
    const zipSize = (zipBuffer.length / 1024).toFixed(1)

    // Build a rich Gumroad description that includes the guide inline
    // (File attachment must be done manually via Gumroad dashboard after creation)
    step = 'building product description'
    const fullDescription = [
      longDescription || description,
      '',
      '---',
      '**What you get:**',
      '- Step-by-step Make.com workflow build guide',
      '- FAQ document',
      '- 3-part email sequence',
      '- Make.com template link (added after build)',
      '',
      `*Blueprint package: ${zipSize}kb ZIP — upload via Gumroad dashboard after product creation*`,
    ].join('\n')

    step = 'creating Gumroad product'
    const product = await createProduct({
      name: title,
      description: fullDescription,
      price: Math.round(price * 100),
      custom_permalink: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
    })

    const productUrl = product.short_url
      || product.url
      || `https://app.gumroad.com/products/${product.id}`

    return NextResponse.json({
      productUrl,
      productId: product.id,
      note: 'Product created. Upload the ZIP file via Gumroad dashboard → Edit Product → Files.',
      zipBase64,
    })

  } catch (error: any) {
    console.error(`Publish failed at step [${step}]:`, error)
    const axiosDetail = error?.response?.data
      ? JSON.stringify(error.response.data)
      : null
    const message = axiosDetail || error?.message || String(error)
    return NextResponse.json(
      { error: `Failed at [${step}]: ${message}` },
      { status: 500 }
    )
  }
}

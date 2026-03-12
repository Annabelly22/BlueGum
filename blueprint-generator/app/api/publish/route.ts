import { NextResponse } from 'next/server'
import { createProduct, enableProduct, createOfferCode } from '@/lib/gumroad'
import { generateGuideMarkdown, createProductZip } from '@/lib/file-generator'
import { uploadZipToSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

interface PublishStep {
  label: string
  status: 'ok' | 'warn' | 'skip'
  detail?: string
}

export async function POST(req: Request) {
  const steps: PublishStep[] = []
  let step = 'parsing request'

  try {
    const body = await req.json()
    const {
      title, description, longDescription,
      stepByStepGuide, faq, emailSequence, salesCopy, price,
    } = body

    if (!process.env.GUMROAD_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'GUMROAD_ACCESS_TOKEN not set in Vercel environment variables.' },
        { status: 500 }
      )
    }

    // ─── STEP 1: Generate guide markdown ───
    step = 'generating guide'
    const guideMarkdown = generateGuideMarkdown(
      title,
      stepByStepGuide,
      faq ?? [],
      emailSequence ?? [],
      salesCopy ?? ''
    )
    steps.push({ label: 'Blueprint guide generated', status: 'ok' })

    // ─── STEP 2: Build ZIP ───
    step = 'building ZIP'
    const templatePlaceholder = '[Make.com template URL — add after you build the workflow]'
    const zipBuffer = await createProductZip(guideMarkdown, templatePlaceholder, faq ?? [])
    steps.push({ label: 'ZIP package assembled', status: 'ok' })

    // ─── STEP 3: Upload to Supabase ───
    step = 'uploading to Supabase'
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    let zipUrl = ''

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      zipUrl = await uploadZipToSupabase(zipBuffer, `${safeTitle}.zip`)
      steps.push({ label: 'ZIP uploaded to Supabase Storage', status: 'ok', detail: zipUrl })
    } else {
      steps.push({ label: 'Supabase upload skipped — env vars not set', status: 'warn' })
    }

    // ─── STEP 4: Build Gumroad description with embedded download link ───
    step = 'building description'
    const downloadSection = zipUrl
      ? [
          '',
          '---',
          '',
          '## 📦 What\'s Included',
          '- ✅ Step-by-step Make.com build guide',
          '- ✅ FAQ document',
          '- ✅ 3-part buyer email sequence',
          '- ✅ Automation template link (added post-build)',
          '',
          `## ⬇️ Download Your Blueprint`,
          `**[Click here to download your blueprint package](${zipUrl})**`,
        ].join('\n')
      : ''

    const fullDescription = (longDescription || description) + downloadSection

    // ─── STEP 5: Create Gumroad product ───
    step = 'creating Gumroad product'
    const product = await createProduct({
      name: title,
      description: fullDescription,
      price: Math.round(price * 100),
      custom_permalink: safeTitle,
    })
    steps.push({ label: 'Gumroad product created', status: 'ok', detail: product.id })

    // ─── STEP 6: Enable / publish product ───
    step = 'enabling product'
    try {
      await enableProduct(product.id)
      steps.push({ label: 'Product published & live', status: 'ok' })
    } catch {
      steps.push({ label: 'Product enable step skipped', status: 'warn' })
    }

    // ─── STEP 7: Create launch offer code (20% off, 50 uses) ───
    step = 'creating offer code'
    let offerCode: string | null = null
    try {
      const code = await createOfferCode(product.id, {
        name: 'LAUNCH20',
        amount_off: 20,
        offer_type: 'percent',
        max_purchase_count: 50,
      })
      offerCode = code.name ?? 'LAUNCH20'
      steps.push({ label: `Launch discount code created: ${offerCode} (20% off, 50 uses)`, status: 'ok' })
    } catch {
      steps.push({ label: 'Offer code skipped', status: 'warn' })
    }

    // ─── BUILD PRODUCT URL ───
    const productUrl =
      product.short_url ||
      product.url ||
      `https://app.gumroad.com/products/${product.id}`

    return NextResponse.json({
      productUrl,
      zipUrl,
      productId: product.id,
      offerCode,
      steps,
    })

  } catch (error: any) {
    console.error(`Publish failed at [${step}]:`, error)
    const axiosDetail = error?.response?.data ? JSON.stringify(error.response.data) : null
    const message = axiosDetail || error?.message || String(error)
    return NextResponse.json(
      { error: `Failed at [${step}]: ${message}`, steps },
      { status: 500 }
    )
  }
}

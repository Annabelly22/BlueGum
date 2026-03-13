import { NextRequest, NextResponse } from 'next/server'
import { generateGuideMarkdown, createProductZip } from '@/lib/file-generator'
import { uploadZipToSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
}

function getModeLabel(mode: string): string {
  if (mode === 'book') return 'book'
  if (mode === 'template') return 'template'
  return 'automation'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, description, longDescription,
      stepByStepGuide, setupGuide, fullContent, customizationGuide,
      faq, emailSequence, salesCopy,
      mode = 'automation',
      price = 27,
    } = body

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

    // Build guide content depending on mode
    const guideContent = stepByStepGuide || setupGuide || fullContent || customizationGuide || ''
    const modeLabel = getModeLabel(mode)

    // Generate markdown
    const guideMarkdown = generateGuideMarkdown(
      title, guideContent, faq ?? [], emailSequence ?? [], salesCopy ?? ''
    )

    // Build ZIP
    const zipBuffer = await createProductZip(
      guideMarkdown,
      mode === 'automation' ? 'https://make.com/templates — paste your template URL here after building' : 'N/A',
      faq ?? []
    )

    // Upload to Supabase with descriptive filename:
    // format: {mode}-{slug}-{timestamp}.zip
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const slug = slugify(title)
    const filename = `${modeLabel}/${modeLabel}-${slug}-${timestamp}.zip`

    const zipUrl = await uploadZipToSupabase(zipBuffer, filename)

    return NextResponse.json({
      success: true,
      zipUrl,
      filename,
      title,
      mode,
      price,
      uploadedAt: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

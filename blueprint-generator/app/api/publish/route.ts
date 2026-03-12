import { NextResponse } from 'next/server'
import { createProduct } from '@/lib/gumroad'
import { generatePDF, createProductZip } from '@/lib/file-generator'

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      longDescription,
      stepByStepGuide,
      faq,
      emailSequence,
      price,
    } = await req.json()

    // 1. Generate PDF guide from stepByStepGuide + FAQ
    const pdfContent = `# ${title}\n\n## Step-by-Step Guide\n${stepByStepGuide}\n\n## Frequently Asked Questions\n${faq.join('\n\n')}`
    const pdfBuffer = await generatePDF(pdfContent)

    // 2. Create a template link placeholder
    const templateLink = 'https://make.com/templates/your-template-id (replace after building)'

    // 3. Create ZIP containing PDF and template link
    const zipBuffer = await createProductZip(pdfBuffer, templateLink, faq)

    // 4. Create product on Gumroad
    const product = await createProduct({
      name: title,
      description: longDescription,
      price: price * 100, // convert to cents
      file: zipBuffer,
      custom_permalink: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })

    return NextResponse.json({ productUrl: product.short_url })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

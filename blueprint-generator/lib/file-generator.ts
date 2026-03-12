import PDFDocument from 'pdfkit'
import JSZip from 'jszip'

export async function generatePDF(content: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const doc = new PDFDocument({ margin: 50 })

    doc.on('data', chunks.push.bind(chunks))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(12).text(content, {
      align: 'left',
      lineGap: 5,
    })

    doc.end()
  })
}

export async function createProductZip(
  pdfBuffer: Buffer,
  templateLink: string,
  faq: string[]
): Promise<Buffer> {
  const zip = new JSZip()

  zip.file('setup-guide.pdf', pdfBuffer)
  zip.file('template-link.txt', templateLink)
  zip.file('faq.txt', faq.join('\n\n'))

  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }))
}

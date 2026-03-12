import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateProductContent(idea: string) {
  const prompt = `You are an expert in no-code automation and digital product creation.
A user wants to create a Make.com automation blueprint product for: "${idea}".

Return ONLY a valid JSON object — no markdown, no code fences, no explanation text.
The JSON must exactly match this structure:

{
  "title": "Catchy product title under 60 chars",
  "description": "2-3 sentence compelling short description",
  "longDescription": "Detailed Gumroad product description, 200-300 words",
  "stepByStepGuide": "Numbered step-by-step guide to build this Make.com workflow, including which modules to use, trigger setup, filters, error handling, and testing tips. At least 8 steps.",
  "faq": [
    "Q: Question one? A: Answer one.",
    "Q: Question two? A: Answer two.",
    "Q: Question three? A: Answer three.",
    "Q: Question four? A: Answer four.",
    "Q: Question five? A: Answer five."
  ],
  "emailSequence": [
    { "subject": "Welcome email subject", "body": "Welcome email body" },
    { "subject": "Follow-up email subject", "body": "Follow-up email body" },
    { "subject": "Upsell email subject", "body": "Upsell email body" }
  ],
  "salesCopy": "Sales headline + 5 bullet points"
}

CRITICAL: Output ONLY the JSON object. Do not wrap in markdown. Do not add any text before or after.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  if (response.content[0].type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  const raw = response.content[0].text.trim()

  // Strip any accidental markdown fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (parseErr) {
    console.error('JSON parse failed. Raw response:', raw)
    throw new Error(`Failed to parse Claude response as JSON: ${(parseErr as Error).message}`)
  }
}

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateProductContent(idea: string) {
  const prompt = `You are an expert in no-code automation and digital product creation.
A user wants to create a Make.com automation blueprint for: "${idea}".

Generate the following items in JSON format (no extra text):
{
  "title": "Catchy product title (max 60 chars)",
  "description": "2-3 sentence compelling description",
  "longDescription": "Detailed description for Gumroad (200-300 words)",
  "stepByStepGuide": "Step-by-step guide for building the Make.com workflow. Include modules, triggers, error handling tips.",
  "faq": ["Question 1? Answer 1.", "Question 2? Answer 2."],
  "emailSequence": [
    { "subject": "Email 1 subject", "body": "Email 1 body" },
    { "subject": "Email 2 subject", "body": "Email 2 body" },
    { "subject": "Email 3 subject", "body": "Email 3 body" }
  ],
  "salesCopy": "Short sales page headline and bullet points"
}

Return valid JSON only.`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(content)
}

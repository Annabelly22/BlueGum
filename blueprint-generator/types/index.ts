export interface GeneratedContent {
  title: string
  description: string
  longDescription: string
  stepByStepGuide: string
  faq: string[]
  emailSequence: Array<{ subject: string; body: string }>
  salesCopy: string
}

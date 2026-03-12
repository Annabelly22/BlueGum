'use client'

import { useState } from 'react'

interface GeneratedContent {
  title: string
  description: string
  longDescription: string
  stepByStepGuide: string
  faq: string[]
  emailSequence: Array<{ subject: string; body: string }>
  salesCopy: string
  demandData?: any
}

export default function Home() {
  const [idea, setIdea] = useState('')
  const [useSerp, setUseSerp] = useState(false)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(39)

  const handleGenerate = async () => {
    if (!idea) return
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, useSerp }),
      })
      const data = await res.json()
      setGenerated(data)
    } catch (error) {
      alert('Error generating content. Check console.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!generated) return
    setLoading(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...generated, price }),
      })
      const { productUrl } = await res.json()
      alert(`✅ Product published! ${productUrl}`)
    } catch (error) {
      alert('Error publishing. Check console.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Automation Blueprint Generator</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <label className="block text-lg font-medium mb-2">
          Describe your automation idea
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="e.g., auto-extract invoices from Gmail to Google Sheets and send Slack notification"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="useSerp"
            checked={useSerp}
            onChange={(e) => setUseSerp(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="useSerp">Use SerpAPI for market research (optional)</label>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !idea}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {generated && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Generated Product</h2>

          <div className="mb-6">
            <label className="block font-medium">Title</label>
            <input
              type="text"
              value={generated.title}
              onChange={(e) => setGenerated({ ...generated, title: e.target.value })}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div className="mb-6">
            <label className="block font-medium">Short Description</label>
            <textarea
              value={generated.description}
              onChange={(e) => setGenerated({ ...generated, description: e.target.value })}
              className="w-full p-2 border rounded mt-1"
              rows={2}
            />
          </div>

          <div className="mb-6">
            <label className="block font-medium">Long Description</label>
            <textarea
              value={generated.longDescription}
              onChange={(e) => setGenerated({ ...generated, longDescription: e.target.value })}
              className="w-full p-2 border rounded mt-1 font-mono text-sm"
              rows={6}
            />
          </div>

          <details className="mb-4">
            <summary className="cursor-pointer text-blue-600">Preview Guide & FAQ</summary>
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <h4 className="font-semibold">Step-by-Step Guide</h4>
              <pre className="whitespace-pre-wrap text-sm">{generated.stepByStepGuide}</pre>
              <h4 className="font-semibold mt-4">FAQ</h4>
              <ul className="list-disc pl-5">
                {generated.faq.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </details>

          <div className="mb-6">
            <label className="block font-medium">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-32 p-2 border rounded"
              min="1"
              step="1"
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish to Gumroad'}
          </button>
        </div>
      )}
    </main>
  )
}

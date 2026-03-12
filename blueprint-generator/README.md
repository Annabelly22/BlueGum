# Blueprint Generator – Automation Blueprint Creator

This Next.js app automates the creation and publishing of Make.com automation blueprint products on Gumroad. It uses Claude API to generate product content (title, description, guide, FAQ, email sequence) and optionally SerpAPI for market research. You can then publish directly to Gumroad with one click.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your API keys.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `ANTHROPIC_API_KEY` – Your Claude API key from Anthropic.
- `GUMROAD_ACCESS_TOKEN` – Your Gumroad access token (get from Gumroad settings).
- `SERPAPI_KEY` – (Optional) Your SerpAPI key for market research.

## Deployment on Vercel

1. Push this repository to GitHub.
2. Import the project on Vercel.
3. Add the same environment variables in Vercel dashboard.
4. Deploy.

## How It Works

1. Enter your automation idea (e.g., "auto-extract invoices from Gmail to Google Sheets").
2. (Optional) Run market research via SerpAPI.
3. Claude generates a product title, description, step-by-step guide, FAQ, and email sequence.
4. Review and edit the generated content.
5. Set a price and click "Publish to Gumroad".
6. The app creates a ZIP file containing a PDF guide and a placeholder template link, then creates a Gumroad product with that file.
7. After you actually build the Make.com workflow, you replace the placeholder link via Gumroad dashboard.

## Notes

- The PDF guide is generated server-side using `pdfkit`.
- The Gumroad product is created with a ZIP file attachment.
- The template link is a placeholder – you must manually update it after building the actual Make.com template.

const GUMROAD_API = 'https://api.gumroad.com/v2'

// The single BlueGum template product - created manually on Gumroad
export const BLUEGUM_PRODUCT_ID = 'wxeyzln'

function getToken(): string {
  const token = process.env.GUMROAD_ACCESS_TOKEN
  if (!token) throw new Error('GUMROAD_ACCESS_TOKEN is not set')
  return token
}

function url(path: string): string {
  return `${GUMROAD_API}${path}?access_token=${getToken()}`
}

function toForm(data: Record<string, string | number | boolean>): URLSearchParams {
  const form = new URLSearchParams()
  for (const [k, v] of Object.entries(data)) {
    form.append(k, String(v))
  }
  return form
}

// Update an existing product (PUT) — replaces POST create since Gumroad blocks that endpoint
export async function updateProduct(
  productId: string,
  data: {
    name: string
    description: string
    price: number
    published?: boolean
    url?: string
  }
): Promise<{ id: string; name: string; short_url: string; preview_url: string }> {
  const res = await fetch(url(`/products/${productId}`), {
    method: 'PUT',
    body: toForm({
      name: data.name,
      description: data.description,
      price: data.price,
      ...(data.published !== undefined ? { published: data.published } : {}),
      ...(data.url ? { url: data.url } : {}),
    }),
  })

  const text = await res.text()
  if (text.trim().startsWith('<')) {
    throw new Error(`Gumroad returned HTML (status ${res.status}) — endpoint may be invalid`)
  }

  const json = JSON.parse(text)
  if (!json.success) throw new Error(json.message || 'Gumroad updateProduct failed')
  return json.product
}

// Enable/publish a product
export async function enableProduct(productId: string): Promise<void> {
  const res = await fetch(url(`/products/${productId}/enable`), {
    method: 'PUT',
    body: toForm({}),
  })
  const text = await res.text()
  if (text.trim().startsWith('<')) {
    throw new Error(`Gumroad returned HTML on enable (status ${res.status})`)
  }
  const json = JSON.parse(text)
  if (!json.success) throw new Error(json.message || 'Gumroad enableProduct failed')
}

// List all offer codes for a product
export async function listOfferCodes(productId: string): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(url(`/products/${productId}/offer_codes`), { method: 'GET' })
  const json = await res.json()
  return json.offer_codes || []
}

// Delete an existing offer code
export async function deleteOfferCode(productId: string, offerId: string): Promise<void> {
  await fetch(url(`/products/${productId}/offer_codes/${offerId}`), { method: 'DELETE' })
}

// Create a new offer code
export async function createOfferCode(
  productId: string,
  opts: { name: string; amount_off: number; max_purchase_count?: number; percent_off?: boolean }
): Promise<{ id: string; name: string; amount_off: number }> {
  const body: Record<string, string | number | boolean> = {
    name: opts.name,
    amount_off: opts.amount_off,
  }
  if (opts.max_purchase_count !== undefined) body.max_purchase_count = opts.max_purchase_count
  if (opts.percent_off !== undefined) body.percent_off = opts.percent_off

  const res = await fetch(url(`/products/${productId}/offer_codes`), {
    method: 'POST',
    body: toForm(body),
  })
  const text = await res.text()
  if (text.trim().startsWith('<')) {
    throw new Error(`Gumroad returned HTML on offer code create (status ${res.status})`)
  }
  const json = JSON.parse(text)
  if (!json.success) throw new Error(json.message || 'Gumroad createOfferCode failed')
  return json.offer_code
}

// Get user info (health check)
export async function getUser(): Promise<{ email: string; name: string }> {
  const res = await fetch(url('/user'), { method: 'GET' })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Gumroad getUser failed')
  return json.user
}

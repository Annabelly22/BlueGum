import axios from 'axios'

const GUMROAD_API = 'https://api.gumroad.com/v2'

function getToken() {
  const token = process.env.GUMROAD_ACCESS_TOKEN
  if (!token) throw new Error('GUMROAD_ACCESS_TOKEN is not set in Vercel environment variables.')
  return token
}

// Token always goes in the URL as a query param — works for GET, POST, PUT, DELETE
function url(path: string) {
  return `${GUMROAD_API}${path}?access_token=${getToken()}`
}

// Product data goes as form body
function toForm(obj: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) params.append(k, String(v))
  }
  return params
}

/* ─── CREATE PRODUCT ─── */
export interface CreateProductParams {
  name: string
  description: string
  price: number
  custom_permalink?: string
}

export async function createProduct(params: CreateProductParams) {
  const res = await axios.post(
    url('/products'),
    toForm({
      name: params.name,
      description: params.description,
      price: params.price,
      ...(params.custom_permalink ? { custom_permalink: params.custom_permalink } : {}),
    })
  )
  if (!res.data.success) {
    throw new Error(`Gumroad create failed: ${JSON.stringify(res.data)}`)
  }
  return res.data.product
}

/* ─── ENABLE PRODUCT ─── */
export async function enableProduct(productId: string) {
  await axios.put(url(`/products/${productId}/enable`), toForm({}))
}

/* ─── DISABLE PRODUCT ─── */
export async function disableProduct(productId: string) {
  await axios.put(url(`/products/${productId}/disable`), toForm({}))
}

/* ─── UPDATE PRODUCT ─── */
export async function updateProduct(productId: string, params: Record<string, any>) {
  const res = await axios.put(url(`/products/${productId}`), toForm(params))
  if (!res.data.success) {
    throw new Error(`Gumroad update failed: ${JSON.stringify(res.data)}`)
  }
  return res.data.product
}

/* ─── DELETE PRODUCT ─── */
export async function deleteProduct(productId: string) {
  const res = await axios.delete(url(`/products/${productId}`))
  return res.data
}

/* ─── LIST PRODUCTS ─── */
export async function listProducts() {
  const res = await axios.get(url('/products'))
  return res.data.products ?? []
}

/* ─── GET SALES ─── */
export async function getSales(params?: { after?: string; before?: string; page?: number }) {
  const res = await axios.get(url('/sales'), { params })
  return res.data.sales ?? []
}

/* ─── CREATE OFFER CODE ─── */
export interface CreateOfferParams {
  name: string
  amount_off: number
  offer_type?: 'cents' | 'percent'
  max_purchase_count?: number
}

export async function createOfferCode(productId: string, params: CreateOfferParams) {
  const res = await axios.post(
    url(`/products/${productId}/offer_codes`),
    toForm({
      name: params.name,
      amount_off: params.amount_off,
      offer_type: params.offer_type ?? 'percent',
      ...(params.max_purchase_count ? { max_purchase_count: params.max_purchase_count } : {}),
    })
  )
  if (!res.data.success) {
    throw new Error(`Gumroad offer code failed: ${JSON.stringify(res.data)}`)
  }
  return res.data.offer_code
}

/* ─── LIST OFFER CODES ─── */
export async function listOfferCodes(productId: string) {
  const res = await axios.get(url(`/products/${productId}/offer_codes`))
  return res.data.offer_codes ?? []
}

/* ─── DELETE OFFER CODE ─── */
export async function deleteOfferCode(productId: string, offerCodeId: string) {
  const res = await axios.delete(url(`/products/${productId}/offer_codes/${offerCodeId}`))
  return res.data
}

/* ─── GET SUBSCRIBERS ─── */
export async function getSubscribers(productId: string) {
  const res = await axios.get(url(`/products/${productId}/subscribers`))
  return res.data.subscribers ?? []
}

/* ─── VERIFY LICENSE ─── */
export async function verifyLicense(productId: string, licenseKey: string) {
  const res = await axios.post(
    url('/licenses/verify'),
    toForm({ product_id: productId, license_key: licenseKey })
  )
  return res.data
}

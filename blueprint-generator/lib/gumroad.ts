import axios from 'axios'

const GUMROAD_API = 'https://api.gumroad.com/v2'

function getHeaders() {
  const token = process.env.GUMROAD_ACCESS_TOKEN
  if (!token) throw new Error('GUMROAD_ACCESS_TOKEN is not set in Vercel environment variables.')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/* ─── CREATE PRODUCT ─── */
export interface CreateProductParams {
  name: string
  description: string
  price: number // in cents
  custom_permalink?: string
}

export async function createProduct(params: CreateProductParams) {
  const res = await axios.post(
    `${GUMROAD_API}/products`,
    {
      name: params.name,
      description: params.description,
      price: params.price,
      ...(params.custom_permalink ? { custom_permalink: params.custom_permalink } : {}),
    },
    { headers: getHeaders() }
  )
  if (!res.data.success) {
    throw new Error(`Gumroad create failed: ${JSON.stringify(res.data)}`)
  }
  return res.data.product
}

/* ─── ENABLE PRODUCT ─── */
export async function enableProduct(productId: string) {
  await axios.put(
    `${GUMROAD_API}/products/${productId}/enable`,
    {},
    { headers: getHeaders() }
  )
}

/* ─── DISABLE PRODUCT ─── */
export async function disableProduct(productId: string) {
  await axios.put(
    `${GUMROAD_API}/products/${productId}/disable`,
    {},
    { headers: getHeaders() }
  )
}

/* ─── UPDATE PRODUCT ─── */
export interface UpdateProductParams {
  name?: string
  description?: string
  price?: number
  custom_permalink?: string
  published?: boolean
}

export async function updateProduct(productId: string, params: UpdateProductParams) {
  const res = await axios.put(
    `${GUMROAD_API}/products/${productId}`,
    params,
    { headers: getHeaders() }
  )
  if (!res.data.success) {
    throw new Error(`Gumroad update failed: ${JSON.stringify(res.data)}`)
  }
  return res.data.product
}

/* ─── DELETE PRODUCT ─── */
export async function deleteProduct(productId: string) {
  const res = await axios.delete(
    `${GUMROAD_API}/products/${productId}`,
    { headers: getHeaders() }
  )
  return res.data
}

/* ─── LIST PRODUCTS ─── */
export async function listProducts() {
  const res = await axios.get(`${GUMROAD_API}/products`, { headers: getHeaders() })
  return res.data.products ?? []
}

/* ─── GET SALES ─── */
export async function getSales(params?: { after?: string; before?: string; page?: number }) {
  const res = await axios.get(`${GUMROAD_API}/sales`, {
    headers: getHeaders(),
    params,
  })
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
    `${GUMROAD_API}/products/${productId}/offer_codes`,
    {
      name: params.name,
      amount_off: params.amount_off,
      offer_type: params.offer_type ?? 'percent',
      ...(params.max_purchase_count ? { max_purchase_count: params.max_purchase_count } : {}),
    },
    { headers: getHeaders() }
  )
  if (!res.data.success) {
    throw new Error(`Gumroad offer code failed: ${JSON.stringify(res.data)}`)
  }
  return res.data.offer_code
}

/* ─── LIST OFFER CODES ─── */
export async function listOfferCodes(productId: string) {
  const res = await axios.get(
    `${GUMROAD_API}/products/${productId}/offer_codes`,
    { headers: getHeaders() }
  )
  return res.data.offer_codes ?? []
}

/* ─── DELETE OFFER CODE ─── */
export async function deleteOfferCode(productId: string, offerCodeId: string) {
  const res = await axios.delete(
    `${GUMROAD_API}/products/${productId}/offer_codes/${offerCodeId}`,
    { headers: getHeaders() }
  )
  return res.data
}

/* ─── GET SUBSCRIBERS (for membership products) ─── */
export async function getSubscribers(productId: string) {
  const res = await axios.get(
    `${GUMROAD_API}/products/${productId}/subscribers`,
    { headers: getHeaders() }
  )
  return res.data.subscribers ?? []
}

/* ─── VERIFY LICENSE ─── */
export async function verifyLicense(productId: string, licenseKey: string) {
  const res = await axios.post(
    `${GUMROAD_API}/licenses/verify`,
    { product_id: productId, license_key: licenseKey },
    { headers: getHeaders() }
  )
  return res.data
}

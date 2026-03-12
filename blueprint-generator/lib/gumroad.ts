import axios from 'axios'

const GUMROAD_API = 'https://api.gumroad.com/v2'

interface CreateProductParams {
  name: string
  description: string
  price: number // in cents
  custom_permalink?: string
}

export async function createProduct(params: CreateProductParams) {
  const token = process.env.GUMROAD_ACCESS_TOKEN!

  // Step 1: Create the product (JSON body, Bearer auth, no file)
  const productRes = await axios.post(
    `${GUMROAD_API}/products`,
    {
      name: params.name,
      description: params.description,
      price: params.price,
      ...(params.custom_permalink ? { custom_permalink: params.custom_permalink } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!productRes.data.success) {
    throw new Error(`Gumroad product creation failed: ${JSON.stringify(productRes.data)}`)
  }

  const product = productRes.data.product

  // Step 2: Publish it so it's live
  await axios.put(
    `${GUMROAD_API}/products/${product.id}/enable`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  ).catch(() => {
    // non-fatal if enable fails — product still created
  })

  return product
}

import axios from 'axios'
import FormData from 'form-data'

const GUMROAD_API = 'https://api.gumroad.com/v2'

interface CreateProductParams {
  name: string
  description: string
  price: number // in cents
  file?: Buffer
  custom_permalink?: string
}

export async function createProduct(params: CreateProductParams) {
  const form = new FormData()
  form.append('access_token', process.env.GUMROAD_ACCESS_TOKEN!)
  form.append('name', params.name)
  form.append('description', params.description)
  form.append('price', params.price.toString())
  if (params.file) {
    form.append('file', params.file, { filename: 'product.zip', contentType: 'application/zip' })
  }
  if (params.custom_permalink) {
    form.append('custom_permalink', params.custom_permalink)
  }

  const response = await axios.post(`${GUMROAD_API}/products`, form, {
    headers: form.getHeaders(),
  })

  return response.data.product
}

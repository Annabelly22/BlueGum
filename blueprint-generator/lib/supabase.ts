import { createClient } from '@supabase/supabase-js'

const BUCKET = 'blueprints'

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in Vercel environment variables.')
  }
  return createClient(url, key)
}

export async function uploadZipToSupabase(zipBuffer: Buffer, filename: string): Promise<string> {
  const supabase = getClient()
  const path = `${Date.now()}-${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, zipBuffer, {
      contentType: 'application/zip',
      upsert: false,
    })

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}. Make sure the "blueprints" bucket exists and is set to PUBLIC.`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  if (!data?.publicUrl) {
    throw new Error('Supabase returned no public URL. Ensure the "blueprints" bucket is PUBLIC.')
  }

  return data.publicUrl
}

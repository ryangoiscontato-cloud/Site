import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xdmbzqvwombhxcgiwsmm.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CcsGLC_0Seo_aW7F7-yx5w_JcN55_z2'

export const supabase = createClient(url, key)
export const isConfigured = true

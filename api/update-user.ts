import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )

  const { userId, countryId, role } = req.body as {
    userId: string
    countryId: string | null
    role: 'admin' | 'member'
  }

  if (!userId || !role) {
    res.status(400).json({ error: 'userId and role are required' })
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ country_id: countryId, role })
    .eq('id', userId)

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  res.status(200).json({ ok: true })
}

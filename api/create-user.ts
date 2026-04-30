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

  const { email, full_name, password, role, country_id } = req.body as {
    email: string
    full_name: string
    password: string
    role: 'admin' | 'member'
    country_id: string | null
  }

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      email,
      full_name: full_name || null,
      role,
      country_id: country_id || null,
    })

  if (profileError) {
    res.status(400).json({ error: profileError.message })
    return
  }

  res.status(200).json({ ok: true })
}

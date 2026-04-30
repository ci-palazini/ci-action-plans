import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'

function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/update-user', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        try {
          const rawBody = await new Promise<string>((resolve, reject) => {
            let data = ''
            req.on('data', (chunk: Buffer) => { data += chunk.toString() })
            req.on('end', () => resolve(data))
            req.on('error', reject)
          })
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SECRET_KEY)
          const { userId, countryId, role } = JSON.parse(rawBody)
          if (!userId || !role) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'userId and role are required' }))
            return
          }
          const { error } = await supabase.from('profiles').update({ country_id: countryId, role }).eq('id', userId)
          res.statusCode = error ? 400 : 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(error ? { error: error.message } : { ok: true }))
        } catch (err: unknown) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }))
        }
      })

      server.middlewares.use('/api/create-user', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        try {
          const rawBody = await new Promise<string>((resolve, reject) => {
            let data = ''
            req.on('data', (chunk: Buffer) => { data += chunk.toString() })
            req.on('end', () => resolve(data))
            req.on('error', reject)
          })

          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SECRET_KEY)
          const { email, full_name, password, role, country_id } = JSON.parse(rawBody)

          if (!email || !password) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'email and password are required' }))
            return
          }

          const { data: userData, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name },
          })

          if (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error.message }))
            return
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: userData.user.id,
              email,
              full_name: full_name || null,
              role,
              country_id: country_id || null,
            })

          if (profileError) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: profileError.message }))
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        } catch (err: unknown) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), devApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})

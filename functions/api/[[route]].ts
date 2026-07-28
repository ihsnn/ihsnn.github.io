import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'

// This file becomes your backend. Cloudflare Pages treats any file under
// /functions as a serverless "Pages Function" — the [[route]] filename is
// a catch-all, so every request under /api/* (e.g. /api/hello, /api/anything)
// is routed into this one Hono app. Add new endpoints below with app.get/post/etc.
//
// Locally: `npm run pages:dev` (see package.json) runs this exact function
// through Wrangler, so you can test it before deploying.

const app = new Hono().basePath('/api')

app.use('/*', cors())

app.get('/hello', (c) => {
  return c.json({ message: 'Hello from Hono on Cloudflare Pages Functions!' })
})

// Example POST endpoint — swap this out for real logic (e.g. calling the
// Anthropic API server-side, the way PokéScan's old vision-based recognizer
// did, if you ever want to bring that approach back with a key that stays
// on the server).
app.post('/echo', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json({ youSent: body })
})

export const onRequest = handle(app)

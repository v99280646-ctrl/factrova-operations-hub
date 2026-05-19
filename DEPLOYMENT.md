# Deployment

## Vercel

This app is configured for Vercel with TanStack Start and Nitro.

Use the default Vercel settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output: generated automatically by Nitro in `.vercel/output`

Required environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Add these only if server-side Supabase helpers are used in production:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Local verification:

```bash
npm run build
```

To test the exact Vercel output locally:

```bash
$env:VERCEL='1'; npm run build
```

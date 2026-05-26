# AI Cheatsheet

A developer cheatsheet for AI product names, model IDs, and the stacks people actually mean.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js. No custom build settings needed.
4. After the first deploy, set an environment variable in **Project → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://ai-cheatsheet.vercel.app`)
5. Redeploy so Open Graph links and metadata use the correct domain.

### CLI deploy

```bash
npm i -g vercel
vercel
vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard when prompted or via `vercel env add`.

## Brand assets

| File | Purpose |
|------|---------|
| `public/brand/logo.png` | Full logo (512px source) |
| `public/brand/icon-*.png` | Sized icons (16–512) |
| `src/app/icon.png` | Next.js app icon |
| `src/app/apple-icon.png` | Apple touch icon |
| `src/app/favicon.ico` | Browser favicon |
| `src/app/opengraph-image.png` | Social preview |
| `public/site.webmanifest` | PWA manifest |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

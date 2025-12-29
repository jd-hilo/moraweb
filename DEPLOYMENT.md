# Deployment Guide

## Option 1: Vercel (Recommended - Easiest)

### Steps:

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repo at [vercel.com](https://vercel.com)

3. **Set Environment Variables** in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLAUDE_API_KEY`
   - `VITE_MIXPANEL_TOKEN`
   - `VITE_PROXY_URL` - Set to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

4. **Update `VITE_PROXY_URL`** in your frontend code to use Vercel's serverless function:
   - The proxy endpoint will be at: `https://your-app.vercel.app/api/claude/generate`
   - Update `src/lib/claude.ts` to use this URL in production

### Vercel Configuration:
- ✅ Frontend automatically builds and deploys
- ✅ Serverless API function at `/api/claude/generate`
- ✅ Free tier includes generous limits
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## Option 2: Railway (Full-Stack Hosting)

### Steps:

1. **Create `railway.json`** (already created)
2. **Connect GitHub** to Railway
3. **Set Environment Variables** in Railway dashboard
4. **Deploy** - Railway auto-detects and deploys

### Railway Configuration:
- ✅ Hosts both frontend and backend together
- ✅ Uses your existing `server.js`
- ✅ Free tier available
- ✅ Automatic HTTPS

---

## Option 3: Render (Alternative Full-Stack)

### Steps:

1. **Create `render.yaml`** (already created)
2. **Connect GitHub** to Render
3. **Set Environment Variables**
4. **Deploy**

### Render Configuration:
- ✅ Similar to Railway
- ✅ Free tier available
- ✅ Automatic HTTPS

---

## Option 4: Netlify (Frontend + Functions)

### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Set Environment Variables** in Netlify dashboard

### Netlify Configuration:
- ✅ Frontend hosting
- ✅ Serverless functions for API
- ✅ Free tier available

---

## Environment Variables Needed:

All platforms need these environment variables:

```
VITE_SUPABASE_URL=https://ihztzhylkrvfwbzehiqe.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_CLAUDE_API_KEY=your_claude_key
VITE_MIXPANEL_TOKEN=your_mixpanel_token
VITE_PROXY_URL=your_proxy_url (depends on platform)
```

---

## Post-Deployment Checklist:

- [ ] Update `VITE_PROXY_URL` to production URL
- [ ] Test authentication flow
- [ ] Test simulation generation
- [ ] Verify Mixpanel tracking
- [ ] Check Supabase RLS policies for public access
- [ ] Test shared simulation links
- [ ] Set up custom domain (optional)

---

## Recommended: Vercel

**Why Vercel?**
- Easiest setup
- Best for React/Vite apps
- Serverless functions included
- Excellent free tier
- Automatic deployments from GitHub
- Built-in analytics

**Quick Start:**
1. Push code to GitHub
2. Import project at vercel.com
3. Add environment variables
4. Deploy!




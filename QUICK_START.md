# Quick Start: Deploy to Vercel (5 minutes)

## Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Web Interface (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Vite settings

### Option B: Via CLI
```bash
npm i -g vercel
vercel
```

## Step 3: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
VITE_SUPABASE_URL=https://ihztzhylkrvfwbzehiqe.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_CLAUDE_API_KEY=your_claude_key_here
VITE_MIXPANEL_TOKEN=1ce0090bc0bcfbadb8122252aaf7e21f
```

**Important:** After adding env vars, redeploy:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

## Step 4: Update Proxy URL (After First Deploy)

After your first deployment, Vercel will give you a URL like:
`https://your-app.vercel.app`

1. Go to Environment Variables
2. Add: `VITE_PROXY_URL=https://your-app.vercel.app`
3. Redeploy

**OR** the code will auto-detect production and use relative paths (no need to set this).

## Step 5: Test

Visit your Vercel URL and test:
- ✅ Sign up flow
- ✅ Onboarding
- ✅ Simulation generation
- ✅ Sharing links

## That's it! 🎉

Your app is now live. Vercel will auto-deploy on every git push.

---

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS instructions

---

## Troubleshooting

**API calls failing?**
- Check environment variables are set
- Make sure you redeployed after adding env vars
- Check Vercel function logs in Dashboard → Functions

**Build failing?**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`




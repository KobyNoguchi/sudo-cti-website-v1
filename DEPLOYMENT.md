# Cloudflare Deployment Guide

## Prerequisites

1. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)
2. **Git Repository** - Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Cloudflare Pages** - Free hosting for Next.js applications

## Step 1: Prepare Your Next.js App

### Build Configuration

Your `next.config.js` is already configured. For Cloudflare Pages, you may want to add:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optional: for better Cloudflare compatibility
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}
```

### Environment Variables

Create a `.env.production` file (don't commit this, add to `.gitignore`):

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://sudocti.com
```

## Step 2: Deploy to Cloudflare Pages

### Option A: Connect via Cloudflare Dashboard

1. **Log into Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** in the sidebar

2. **Create a New Project**
   - Click **Create a project**
   - Click **Connect to Git**
   - Authorize Cloudflare to access your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository: `sudo-cti-website` (or your repo name)

3. **Configure Build Settings**
   - **Project name**: `sudocti-website` (or your preferred name)
   - **Production branch**: `main` (or `master`)
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: Leave EMPTY (Cloudflare Pages Next.js runtime handles this automatically)
   - **Root directory**: `/` (leave as root)

4. **Environment Variables** (if needed)
   - Add any environment variables in the **Environment variables** section
   - For example: `NODE_ENV=production`

5. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will build and deploy your site
   - You'll get a URL like: `sudocti-website.pages.dev`

### Option B: Deploy via Wrangler CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build your Next.js app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=sudocti-website
```

## Step 3: Configure Custom Domain in Cloudflare

### In Cloudflare Pages Dashboard:

1. **Go to your Pages project**
   - Click on your project name
   - Go to **Custom domains** tab

2. **Add Custom Domain**
   - Click **Set up a custom domain**
   - Enter: `sudocti.com`
   - Click **Continue**

3. **DNS Configuration** (if domain is in Cloudflare)
   - Cloudflare will automatically add the necessary DNS records
   - You'll see a CNAME record pointing to your Pages deployment

### Manual DNS Configuration (if domain is NOT in Cloudflare):

If your domain (`sudocti.com`) is managed elsewhere:

1. **Get your Pages URL**
   - From Cloudflare Pages dashboard, note your deployment URL
   - Example: `sudocti-website.pages.dev`

2. **Add DNS Records in Your DNS Provider**
   - **CNAME Record**:
     - Name: `@` (or root domain)
     - Value: `sudocti-website.pages.dev`
     - TTL: Auto (or 3600)
   
   - **CNAME Record for www**:
     - Name: `www`
     - Value: `sudocti-website.pages.dev`
     - TTL: Auto (or 3600)

3. **Wait for DNS Propagation**
   - Can take 5 minutes to 48 hours
   - Usually completes within 1-2 hours

## Step 4: SSL/TLS Configuration

Cloudflare automatically provides SSL certificates:

1. **In Cloudflare Dashboard**
   - Go to **SSL/TLS** section
   - Set encryption mode to **Full** or **Full (strict)**
   - This ensures HTTPS is enabled

## Step 5: DNS Records Summary

### If Domain is in Cloudflare:

Cloudflare Pages will automatically create:
- **CNAME**: `sudocti.com` → `sudocti-website.pages.dev`
- **CNAME**: `www.sudocti.com` → `sudocti-website.pages.dev`

### If Domain is Elsewhere:

Add these records manually:
```
Type: CNAME
Name: @
Content: sudocti-website.pages.dev
Proxy: Enabled (if using Cloudflare)

Type: CNAME  
Name: www
Content: sudocti-website.pages.dev
Proxy: Enabled (if using Cloudflare)
```

## Step 6: Post-Deployment Checklist

- [ ] Verify site loads at `https://sudocti.com`
- [ ] Check all images load correctly (`/Assets/...` paths)
- [ ] Test navigation and all pages
- [ ] Verify map component loads correctly
- [ ] Test contact form submission
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate is active (should be automatic)

## Troubleshooting

### Images Not Loading
- Ensure `/Assets/` folder is in `public/` directory
- Check image paths start with `/Assets/...` (leading slash)

### Build Errors
- Check Cloudflare Pages build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Cloudflare uses Node 18+)

### DNS Issues
- Use `dig sudocti.com` or `nslookup sudocti.com` to check DNS
- Ensure CNAME records are correct
- Wait for DNS propagation (can take up to 48 hours)

### Stale Content / Old Content Still Showing

**🚨 CRITICAL: If even the Pages URL (`*.pages.dev`) shows old content:**

This is **NOT** a cache issue. The Framework preset is likely set to **"None"** instead of **"Next.js"**.

**IMMEDIATE ACTION REQUIRED:**
1. Go to Cloudflare Pages → Settings → Builds & deployments
2. Check **Framework preset** - it MUST say **"Next.js"** (not "None")
3. If it says "None", change it to "Next.js" and save
4. Wait for automatic redeployment
5. Test your Pages URL again

See `DEPLOYMENT_FIX.md` for detailed instructions.

---

If your Git branch is up to date but the website still shows old content **after clearing build cache**:

**IMPORTANT**: Build cache and CDN cache are DIFFERENT. You need to clear BOTH.

#### Step 1: Clear Cloudflare CDN Cache (CRITICAL - Often Missed!)

This is different from build cache. The CDN cache stores HTML responses:

1. Go to Cloudflare Dashboard (NOT Pages dashboard)
2. Select your domain (`sudocti.com`)
3. Navigate to **Caching** → **Configuration**
4. Click **Purge Everything** (or **Custom Purge** → enter `https://sudocti.com/*`)
5. Wait 30 seconds for purge to complete

#### Step 2: Verify Deployment Commit

1. In Cloudflare Pages Dashboard → **Deployments** tab
2. Check the latest deployment's commit SHA (e.g., `77ba62e...`)
3. Compare with your GitHub repository's latest commit
4. If they don't match:
   - Push your latest changes: `git push origin main`
   - Or manually trigger deployment in Cloudflare Pages

#### Step 3: Test in Incognito/Private Mode

1. Open an incognito/private browser window
2. Visit `https://sudocti.com`
3. If content is correct in incognito but wrong in normal browser:
   - Your browser cache is the issue
   - Clear browser cache or hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

#### Step 4: Verify Build Configuration

In Cloudflare Pages Dashboard → **Settings** → **Builds & deployments**:

- ✅ **Framework preset**: Must be `Next.js` (NOT "None")
- ✅ **Build output directory**: Should be EMPTY (not `.next`)
- ✅ **Build command**: `npm run build`
- ✅ **Production branch**: `main`

#### Step 5: Check for Old Files

Ensure no `index.html` exists in your repository root (it should be `index.html.old` or deleted):
- Old HTML files can interfere with Next.js routing
- Check GitHub repository to confirm

#### Step 6: Force Fresh Deployment

1. Make a small change (add a comment or whitespace)
2. Commit and push:
   ```bash
   git commit --allow-empty -m "Force fresh deployment"
   git push origin main
   ```
3. Wait for deployment to complete
4. Clear CDN cache again (Step 1)
5. Test in incognito mode

#### Step 7: Verify Content Directly

Check the actual deployed content:
1. Visit your Pages URL directly: `https://your-project.pages.dev` (not custom domain)
2. Compare with `https://sudocti.com`
3. If Pages URL shows correct content but custom domain shows old:
   - CDN cache issue - repeat Step 1
   - DNS propagation issue - wait 5-10 minutes

#### Step 8: Add Cache-Control Headers (NEW)

A `_headers` file has been added to `public/_headers` to prevent HTML caching:
- This file tells Cloudflare to never cache HTML pages
- Static assets (images, JS, CSS) are still cached for performance
- After adding this file, commit and push:
  ```bash
  git add public/_headers
  git commit -m "Add cache-control headers to prevent HTML caching"
  git push origin main
  ```
- Wait for deployment, then purge CDN cache again

#### Step 9: Critical Diagnostic Checklist

If you've tried everything above and still see old content, verify these **CRITICAL** settings:

**In Cloudflare Pages Dashboard → Settings → Builds & deployments:**

1. **Framework preset**: 
   - ❌ If set to "None" → Change to "Next.js" (THIS IS CRITICAL!)
   - ✅ Must be "Next.js" for Next.js runtime to work

2. **Build output directory**:
   - ❌ If set to `.next` → Clear it (leave EMPTY)
   - ✅ Should be EMPTY when Framework preset is "Next.js"

3. **Production branch**:
   - ✅ Should be `main` (or `master`)

4. **Build command**:
   - ✅ Should be `npm run build`

**Verify the deployed commit:**
- Check Cloudflare Pages → Deployments → Latest deployment
- Note the commit SHA (e.g., `77ba62e308d72af7a566368fbe63c2d708c42407`)
- Go to your GitHub repository
- Compare: Does the deployed commit match your latest commit?
- If NO: Your latest changes aren't deployed yet → Push to trigger deployment

**Check what content you're seeing:**
- What specific "old content" are you seeing?
- Is it the entire page, or specific sections?
- Can you describe what the old content says vs what it should say?

### Performance
- Cloudflare Pages automatically provides CDN
- Images are optimized via Next.js Image component
- Consider enabling Cloudflare's Auto Minify in Speed settings

## Additional Cloudflare Features

### Speed Optimizations
1. **Auto Minify**: Enable in Speed → Optimization
2. **Brotli Compression**: Enabled by default
3. **Caching**: Configure in Caching → Configuration

### Security
1. **WAF Rules**: Add in Security → WAF
2. **Rate Limiting**: Configure in Security → Rate Limiting
3. **Bot Fight Mode**: Enable in Security → Bots

### Analytics
- Cloudflare Analytics: Available in Analytics → Web Analytics
- Real-time visitor stats

## Quick Reference

**Cloudflare Pages Dashboard**: https://dash.cloudflare.com → Pages
**Your Site URL**: https://sudocti.com (after DNS setup)
**Build Command**: `npm run build`
**Node Version**: 18.x (Cloudflare default)


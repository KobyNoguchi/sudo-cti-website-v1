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
   - **Build output directory**: `.next`
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


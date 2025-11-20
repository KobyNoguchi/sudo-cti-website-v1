# Cloudflare Pages Deployment

> **Status:** Archived Cloudflare guidance. Production now uses GitHub Pages.

## Quick Start

1. **Push your code to Git** (GitHub, GitLab, or Bitbucket)

2. **Connect to Cloudflare Pages**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** → **Create a project**
   - Connect your Git repository
   - Configure:
     - Framework: **Next.js**
     - Build command: `npm run build`
     - Build output: `.next`
     - Root directory: `/`

3. **Add Custom Domain**:
   - In your Pages project → **Custom domains**
   - Add `sudocti.com`
   - Cloudflare will auto-configure DNS if domain is in Cloudflare

4. **DNS Configuration** (if domain is elsewhere):
   ```
   CNAME @ → your-project.pages.dev
   CNAME www → your-project.pages.dev
   ```

5. **Deploy**: Cloudflare will automatically build and deploy on every push to main branch

## Build Settings

- **Framework**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Node version**: 18.x (default)

## Environment Variables

Add in Cloudflare Pages → Settings → Environment variables:
- `NODE_ENV=production`
- Any other variables your app needs

## DNS Records

If your domain (`sudocti.com`) is in Cloudflare, Pages will auto-create:
- CNAME: `sudocti.com` → `your-project.pages.dev`
- CNAME: `www.sudocti.com` → `your-project.pages.dev`

If domain is elsewhere, manually add:
- CNAME `@` → `your-project.pages.dev`
- CNAME `www` → `your-project.pages.dev`

## Post-Deployment

- ✅ Verify HTTPS is enabled (automatic)
- ✅ Test all pages and functionality
- ✅ Check image loading (`/Assets/...` paths)
- ✅ Verify map component works
- ✅ Test contact form

## Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Next.js on Cloudflare: https://developers.cloudflare.com/pages/framework-guides/nextjs


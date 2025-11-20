# Disable Cloudflare Access on Pages Site

> **Status:** Archived Cloudflare guidance. Production now uses GitHub Pages.

## What You're Seeing

**Cloudflare Access** is a Zero Trust security feature that's protecting your Pages deployment. This is why you see a login screen asking for an email code when trying to access `*.pages.dev`.

## Why This Matters

Cloudflare Access is blocking public access to your site. This means:
- ❌ Visitors can't see your site
- ❌ You can't test your deployment
- ❌ The site requires authentication to view

For a public website, you typically want to **disable** Cloudflare Access on the Pages site (you can keep it on other resources if needed).

## How to Disable Cloudflare Access

### Option 1: Disable via Cloudflare Zero Trust Dashboard

1. Go to **Cloudflare Zero Trust Dashboard**
   - https://one.dash.cloudflare.com
   - Or go to Cloudflare Dashboard → **Zero Trust**

2. Navigate to **Access** → **Applications**

3. Find your Pages application:
   - Look for `sudo-cti-website-v1` or `*.pages.dev`
   - Or search for applications matching your Pages URL

4. **Delete or Disable the Access Policy:**
   - Click on the application
   - Either **Delete** the application entirely
   - OR **Disable** the access policy
   - Save changes

### Option 2: Check Pages Settings

1. Go to **Cloudflare Pages Dashboard**
   - https://dash.cloudflare.com → **Pages** → `sudo-cti-website-v1`

2. Check **Settings** → **Custom domains** or **Access** section
   - Some Cloudflare accounts have Access settings in Pages
   - Look for any "Access" or "Zero Trust" settings
   - Disable if found

### Option 3: Check if Access is Applied to Domain

If Access is applied at the domain level (`sudocti.com`):

1. Go to **Cloudflare Dashboard**
2. Select domain: `sudocti.com`
3. Go to **Zero Trust** → **Access** → **Applications**
4. Find any applications protecting your domain
5. Delete or disable them

## After Disabling Access

1. **Wait 1-2 minutes** for changes to propagate
2. **Clear your browser cache** or use incognito mode
3. **Visit your Pages URL:**
   - `https://e1638966.sudo-cti-website-v1.pages.dev`
   - Should now load without login screen

## Important Notes

- **Cloudflare Access** is different from **Cloudflare Pages**
- Access adds authentication/authorization layers
- For public websites, you usually don't want Access enabled
- You can keep Access on admin/internal resources if needed

## If You Can't Find Access Settings

If you don't have access to Zero Trust dashboard:

1. **Check who set it up:**
   - Access might have been enabled by another team member
   - Check with your Cloudflare account admin

2. **Contact Cloudflare Support:**
   - They can help disable Access policies
   - Or guide you to the right settings

3. **Check Cloudflare account permissions:**
   - You might need "Super Administrator" or "Zero Trust Admin" role
   - To modify Access policies

## Why This Might Have Been Enabled

Common reasons Access gets enabled:
- Testing/development environment protection
- Accidental enablement
- Security policy applied broadly
- Previous team member's configuration

For a public marketing website like yours, Access should typically be **disabled**.





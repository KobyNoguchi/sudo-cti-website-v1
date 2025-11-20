# CRITICAL FIX: Old Content on Pages URL

> **Status:** Archived Cloudflare guidance. Production now uses GitHub Pages.

## The Problem

If even the **Pages URL** (`*.pages.dev`) shows old content, this means:
- ❌ NOT a CDN cache issue
- ❌ NOT a browser cache issue  
- ✅ **Build output directory is set to `/` (WRONG!)**
- ✅ **Framework preset might be set to "None" instead of "Next.js"**

## Issues Found in Your Configuration

From your build log and settings:
- ❌ **Build output directory**: `/` (WRONG - should be EMPTY or `.next`)
- ❓ **Framework preset**: Not visible (needs verification - should be "Next.js")
- ✅ Build command: `npm run build` (correct)
- ✅ Root directory: `/` (correct)

## Why This Happens

When Framework preset is "None":
- Cloudflare treats your site as a **static HTML site**
- It serves files directly from build output
- It doesn't use the Next.js runtime
- It may serve old `index.html` files if they exist

When Framework preset is "Next.js":
- Cloudflare uses the **Next.js runtime**
- Your React components are rendered server-side
- Dynamic routing works correctly
- Old static files are ignored

## IMMEDIATE FIX (Do This Now)

### Step 1: Fix Build Output Directory (CRITICAL!)

**Your current setting is WRONG:**
- ❌ Build output directory: `/` (root directory)
- ✅ Should be: **EMPTY** (leave blank) or `.next`

**How to fix:**
1. Go to **Cloudflare Pages Dashboard**
2. Click on your project: `sudo-cti-website-v1`
3. Go to **Settings** → **Builds & deployments**
4. Find **"Build output directory"**
5. **Clear it** (delete `/` and leave it EMPTY)
6. Click **Save**

### Step 2: Check Framework Preset

While you're in Settings → Builds & deployments:

1. Look for **"Framework preset"** or **"Framework"**
2. **What does it say?**
   - ❌ If it says **"None"** → Change to "Next.js"
   - ✅ Should say **"Next.js"**

**If Framework preset is "None":**
1. Click **Edit** next to Framework preset
2. Select **"Next.js"** from the dropdown
3. Click **Save**

### Step 3: Save All Changes

After fixing both settings:
1. Click **Save** (if there's a save button)
2. This will trigger a new deployment automatically
3. Go to **Deployments** tab to watch the new build

### Step 4: Wait for Deployment

1. Go to **Deployments** tab
2. A new deployment should start automatically after saving settings
3. Wait for it to complete (watch the build logs)
4. You should see:
   - Next.js build process running
   - Static pages being generated
   - Build completing successfully

### Step 5: Test

1. Visit your Pages URL: `https://e1638966.sudo-cti-website-v1.pages.dev`
2. You should now see your Next.js app with:
   - Hero section: "Purpose-Built Cyber Threat Intelligence"
   - Modern navigation with mega-menu
   - Animated components
   - All React components working

### Step 6: Clear CDN Cache (After Fix)

Once the new deployment is live:
1. Go to Cloudflare Dashboard (not Pages)
2. Select domain: `sudocti.com`
3. Go to **Caching** → **Configuration**
4. Click **Purge Everything**
5. Wait 30 seconds
6. Test `https://sudocti.com` in incognito mode

## Verification Checklist

After fixing, verify these settings in **Settings → Builds & deployments**:

```
✅ Framework preset: Next.js (NOT "None")
✅ Build command: npm run build  
✅ Build output directory: (EMPTY - not "/" or ".next")
✅ Production branch: main
✅ Root directory: / (or empty)
```

**Why Build Output Directory Matters:**

- ❌ **`/` (root)**: Cloudflare looks for static files in root directory → serves old HTML files
- ❌ **`.next`**: Works but not ideal - Cloudflare should auto-detect
- ✅ **EMPTY**: Best option - Cloudflare auto-detects Next.js and uses runtime correctly

## If Framework Preset Was Already "Next.js"

If Framework preset was already set to "Next.js" and you still see old content:

1. **Check the deployed commit**:
   - Go to Deployments → Latest deployment
   - Note the commit SHA
   - Compare with your GitHub repository's latest commit
   - If they don't match, your latest code isn't deployed

2. **Check for old index.html in GitHub**:
   - Go to your GitHub repository
   - Check if `index.html` exists in the root
   - If yes, delete it or rename it

3. **Force a fresh deployment**:
   ```bash
   git commit --allow-empty -m "Force fresh deployment"
   git push origin main
   ```

4. **Clear build cache**:
   - Cloudflare Pages → Settings → Builds & deployments
   - Click "Clear build cache"
   - Wait for redeployment

## Expected Result

After fixing Framework preset to "Next.js", you should see:
- ✅ Modern navigation with mega-menu
- ✅ Hero section with "Purpose-Built Cyber Threat Intelligence"
- ✅ Animated components (Framer Motion)
- ✅ Navy blue theme
- ✅ Interactive ransomware map
- ✅ All React components working

## Still Not Working?

If Framework preset is "Next.js" and you still see old content:

1. Share a screenshot of your Cloudflare Pages Settings → Builds & deployments page
2. Share the commit SHA from the latest deployment
3. Describe what "old content" you're seeing (what text/images are displayed)


# Cloudflare Pages Configuration Fix

## Issue Identified

Your build settings look mostly correct, but there's a **critical missing piece**: The **Framework preset** must be set to **"Next.js"**.

## Current Settings (What You Have):
✅ Build command: `npm run build`
✅ Build output: `.next`
✅ Root directory: (empty)
✅ Production branch: `main`

## What's Missing:

❌ **Framework preset**: Should be **"Next.js"** (this is CRITICAL!)

## How to Fix:

### Step 1: Set Framework Preset

1. In Cloudflare Pages dashboard, go to your project
2. Click **Settings** tab
3. Scroll down to find **"Framework preset"** or **"Framework"** section
4. If you see it set to **"None"** or it's missing, click **Edit**
5. Select **"Next.js"** from the dropdown
6. Save changes

### Step 2: Verify Build Output Directory

When Framework preset is set to "Next.js", Cloudflare will:
- Auto-detect the build output
- Use the correct Next.js runtime
- Handle SSR automatically

You can either:
- **Option A**: Leave "Build output" empty (recommended - let Cloudflare auto-detect)
- **Option B**: Keep it as `.next` (also works)

### Step 3: Ensure Old Files Are Removed

Make sure `index.html` is NOT in your Git repository:

```bash
# Check if index.html is tracked
git ls-files | grep index.html

# If it shows up, remove it:
git rm index.html
git commit -m "Remove old index.html"
git push
```

### Step 4: Clear Build Cache

1. In Cloudflare Pages → Settings → Build cache
2. Click **"Clear Cache"**
3. This will force a fresh build

### Step 5: Trigger New Deployment

1. Go to **Deployments** tab
2. Click **"Retry deployment"** on the latest deployment
   OR
3. Push a new commit to trigger automatic deployment:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push
   ```

## Correct Configuration Summary:

```
Framework preset: Next.js  ← THIS IS CRITICAL!
Build command: npm run build
Build output directory: .next (or leave empty)
Root directory: (empty)
Production branch: main
Node version: 18 (default)
```

## Why Framework Preset Matters:

Without "Next.js" framework preset:
- Cloudflare treats it as a static site
- Serves files from build output directly
- Doesn't use Next.js runtime
- May serve old `index.html` if present

With "Next.js" framework preset:
- Cloudflare uses Next.js runtime
- Handles SSR correctly
- Serves your React components
- Ignores old static files

## Troubleshooting:

If you still see the old site after setting Framework to Next.js:

1. **Check build logs**:
   - Go to Deployments tab
   - Click on latest deployment
   - Check for any build errors

2. **Verify files are committed**:
   ```bash
   git log --oneline -5
   # Should see your recent commits
   ```

3. **Check deployment URL**:
   - Make sure you're viewing the Pages deployment URL
   - Not an old cached version
   - Try incognito/private browsing

4. **Verify Next.js files exist**:
   ```bash
   ls -la app/
   ls -la components/
   # Should see your Next.js files
   ```

## Expected Result:

After fixing, you should see:
- Modern navigation with mega-menu
- Hero section with animations
- Navy blue theme matching IronNet design
- Interactive ransomware map
- All new React components

If Framework preset is missing, that's definitely the issue!


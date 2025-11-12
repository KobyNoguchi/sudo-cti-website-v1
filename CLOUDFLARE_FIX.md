# IMPORTANT: Cloudflare Pages Build Settings

## Correct Build Configuration

When deploying to Cloudflare Pages, use these EXACT settings:

### In Cloudflare Pages Dashboard:

1. **Framework preset**: `Next.js` (this is CRITICAL - don't use "None")
2. **Build command**: `npm run build` (or leave empty - Cloudflare auto-detects)
3. **Build output directory**: `.next` (or leave empty - Cloudflare auto-detects)
4. **Root directory**: `/` (leave empty for root)
5. **Node version**: `18` (or leave default)

### Why This Matters:

- Cloudflare Pages has **native Next.js support** with their runtime
- When you select "Next.js" as the framework preset, Cloudflare:
  - Automatically detects Next.js
  - Uses their optimized Next.js runtime
  - Handles SSR (Server-Side Rendering) automatically
  - Serves your app correctly

### Common Mistakes:

❌ **WRONG**: Setting output directory to `/out` or `/dist`
❌ **WRONG**: Using framework preset "None" 
❌ **WRONG**: Having `output: 'export'` in next.config.js (for static export only)
❌ **WRONG**: Having `output: 'standalone'` (not needed for Cloudflare Pages)

✅ **CORRECT**: Select "Next.js" framework preset and let Cloudflare handle it

### If You're Still Seeing the Old HTML:

1. **Delete or rename `index.html`** - It might be interfering
   ```bash
   mv index.html index.html.old
   ```

2. **Clear Cloudflare Pages cache**:
   - Go to your Pages project
   - Settings → Builds & deployments
   - Clear cache and redeploy

3. **Verify your Git repository**:
   - Make sure `index.html` is NOT in your repo root (or rename it)
   - Ensure all Next.js files (`app/`, `components/`, etc.) are committed

4. **Redeploy**:
   - Push a new commit or manually trigger a rebuild

### File Structure Should Be:

```
your-repo/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── components/
├── public/
│   └── Assets/
├── package.json
├── next.config.js
└── (index.html should be renamed or deleted)
```

### Quick Fix:

1. Rename `index.html` to `index.html.old`:
   ```bash
   mv index.html index.html.old
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Remove old index.html, use Next.js app"
   git push
   ```

3. In Cloudflare Pages:
   - Go to your project
   - Settings → Builds & deployments
   - Click "Retry deployment" or push a new commit

This should fix the issue!


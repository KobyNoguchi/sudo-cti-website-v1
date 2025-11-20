# GitHub Pages Troubleshooting

Use this guide when deployments succeed locally but `https://sudocti.com` does not reflect the latest build.

## 1. Workflow/build failures

1. Open **Actions → Deploy static site to GitHub Pages → failed run**.
2. Expand the failed step for the log snippet.
3. Common fixes:
   - `npm ci` errors → delete `package-lock.json`, rerun `npm install`, commit the updated lockfile.
   - TypeScript errors → run `npm run lint` locally to reproduce.
   - `out` missing → ensure `next.config.js` still has `output: 'export'`.
4. Re-run the workflow from the Actions UI after fixing the underlying issue, or push a new commit.

## 2. Workflow succeeded, site shows old content

1. Confirm the run uploaded an artifact: look for `Upload Pages artifact` in the log.
2. Visit **Deployments → github-pages**. The “Published” timestamp should match the latest run.
3. Hard refresh the browser (`Cmd/Ctrl + Shift + R`). GitHub serves static files directly from the CDN and may cache aggressively.
4. If the CDN is stuck, toggle the custom domain off/on in **Settings → Pages**:
   - Remove the custom domain, save.
   - Add `sudocti.com` back and click **Save**. This forces GitHub to rebuild the edge cache.

## 3. DNS or SSL errors

1. Verify the A records with `nslookup sudocti.com` — results must be the four GitHub IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
2. `www` must be a CNAME pointing to `kobyn.github.io`.
3. Keep `public/CNAME` committed with `sudocti.com`. Without it, GitHub forgets the custom domain during deploys.
4. SSL provisioning can take up to an hour after DNS changes. Use `https://www.whynopadlock.com/` to verify when unsure.

## 4. `404` or broken asset paths on previews

If you host previews at `https://kobyn.github.io/sudo-cti-website-v1`:

1. Set `NEXT_PUBLIC_BASE_PATH=/sudo-cti-website-v1` in the workflow’s **Build static export** step (or via repository secrets).
2. Update `NEXT_PUBLIC_SITE_URL` accordingly.
3. Remember to revert those env vars when shipping to `sudocti.com`. The apex deploy expects an empty base path.

## 5. Manual redeploy / rollback

1. Go to **Actions → Deploy static site to GitHub Pages**.
2. Choose the commit you want, click **Run workflow**, and supply the desired branch/commit if needed.
3. GitHub keeps the last 10 artifacts. Pick the correct one inside **Deployments → github-pages → History** and click **Redeploy** to instantly roll back without rebuilding.

## 6. Local reproduction checklist

```bash
rm -rf node_modules .next out
npm ci
npm run lint
npm run build
npx serve out
```

If the exported site looks right locally but wrong in production, the issue is almost always DNS caching or a stale GitHub Pages deploy.


# GitHub Pages Deployment Guide

Your site now ships as a fully static Next.js export that GitHub Pages hosts from the `out` folder. This document replaces all Cloudflare instructions and is the single source of truth for deployments.

---

## 1. Prerequisites

1. GitHub repository: `kobyn/sudo-cti-website-v1`
2. Node.js 18+ locally for reproducing builds
3. GoDaddy DNS access for `sudocti.com`
4. GitHub Pages enabled on the repository (via the workflow in `.github/workflows/deploy.yml`)

---

## 2. Build configuration

The key Next.js settings live in `next.config.js`:

- `output: 'export'` forces `next build` to emit a static site inside `out/`.
- `images.unoptimized: true` so images are copied verbatim (GitHub Pages cannot run the Next.js image optimizer).
- `NEXT_PUBLIC_BASE_PATH` (default `''`) lets preview deploys live under `/repo-name` without breaking asset paths. Leave it empty for `sudocti.com`.
- `public/CNAME` pins the apex domain and `public/.nojekyll` ensures `_next/*` works on GitHub Pages.

Run builds exactly like production does:

```bash
npm ci
npm run build   # writes ./out
```

---

## 3. GitHub Pages workflow (CI/CD)

The workflow in `.github/workflows/deploy.yml`:

1. Triggers on pushes to `main` or manual `workflow_dispatch`.
2. Checks out the repo, installs dependencies with `npm ci`, and runs `npm run build`.
3. Uploads the `out` directory as the artifact.
4. Uses `actions/deploy-pages@v4` to publish the artifact to GitHub Pages.

All future edits deploy automatically after merging to `main`. No manual steps in the GitHub UI are required after initial setup.

---

## 4. First-time GitHub Pages setup

1. Visit **Settings → Pages** in the repo.
2. Under “Build and deployment” choose **GitHub Actions** (the workflow handles everything).
3. Save. GitHub will create the `github-pages` environment automatically after the first successful run.

---

## 5. GoDaddy DNS for `sudocti.com`

Point the apex to GitHub’s Pages IPs and send `www` traffic to your Pages host:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `185.199.108.153` | 1 hr |
| A | @ | `185.199.109.153` | 1 hr |
| A | @ | `185.199.110.153` | 1 hr |
| A | @ | `185.199.111.153` | 1 hr |
| CNAME | www | `kobyn.github.io` | 1 hr |

Notes:
- Remove any legacy Cloudflare records (TXT, CAA, NS, etc.) that refer to `pages.dev` or Cloudflare proxies.
- DNS propagation typically finishes within 15 minutes but can take up to 24 hours.

---

## 6. Custom domain verification

1. Keep `public/CNAME` committed with `sudocti.com`. GitHub Pages copies it automatically during deploys.
2. In **Settings → Pages → Custom domain**, enter `sudocti.com`. GitHub will validate DNS and provision SSL.
3. After validation, GitHub automatically redirects `www` to the apex.

---

## 7. Deploying updates

1. Branch from `main`, make code changes, and open a PR.
2. Merge into `main`.
3. The workflow runs automatically. Track progress in the **Actions** tab → “Deploy static site to GitHub Pages”.
4. Once complete, verify the production site at `https://sudocti.com`.

Manual trigger: open the workflow run and click **Run workflow** if you need to redeploy the current commit without new changes.

---

## 8. Post-deploy checklist

- [ ] Homepage, About, Services, Industries, Resources, and Contact pages render without console errors.
- [ ] Static assets (hero images, Logos, Ransomware map data) load from `/Assets/*`.
- [ ] Forms and interactive components behave correctly on mobile and desktop.
- [ ] SSL certificate shows “GitHub Pages” and no mixed-content warnings.
- [ ] `www.sudocti.com` redirects to the apex.

---

## 9. Troubleshooting quick hits

| Symptom | Fix |
|---------|-----|
| Workflow fails during `npm ci` | Delete `node_modules`, rerun locally, and commit any lockfile fixes. |
| Workflow succeeds but site shows old build | Confirm the job uploaded `out/` (not `.next/`). Check the workflow logs for `actions/upload-pages-artifact`. |
| 404s for `_next` assets | Ensure `public/.nojekyll` exists and the workflow deployed after adding it. |
| Custom domain shows GitHub 404 page | Re-run DNS lookup to ensure A records point to the four GitHub IPs and that `public/CNAME` still contains `sudocti.com`. |
| Need preview under `https://kobyn.github.io/sudo-cti-website-v1` | Set `NEXT_PUBLIC_BASE_PATH=/sudo-cti-website-v1` in the workflow env to mirror GitHub’s subdirectory hosting. Remember to clear it for production deploys. |

For deeper debugging steps (cache flush, DNS validation commands, etc.) see `docs/github-pages/troubleshooting.md`.

---

## 10. Reference commands

```bash
# Full clean build to mimic CI
rm -rf .next out node_modules
npm ci
npm run build

# Serve the exported HTML locally
npx serve out
```

Keep this guide updated whenever the deployment workflow or hosting provider changes. The Cloudflare docs now live under `docs/archive/cloudflare/` for historical reference only.


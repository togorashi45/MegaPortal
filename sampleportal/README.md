# RSPUR Sample Portal

Fresh clean build of the internal portal for **sample-mode demos**.

## What this build is for
- Host at `sampleportal.rspur.com`
- Full UI/UX walkthrough and content recording
- Real login flow + role/module gating
- All modules interactive with sample data
- **No live API integrations** (intentionally off)

## Stack
- Next.js 15 (App Router)
- TypeScript (strict)
- Server route handlers for auth/admin actions
- Cookie-based session auth (demo-safe approach)

## Demo credentials
- `jake@rspur.com` / `sample123` (SUPER_ADMIN)
- `ian@rspur.com` / `sample123` (ADMIN)
- `ava@rspur.com` / `sample123` (MEMBER)

## Modules included
- Dashboard
- Mission Control
- KPI Tracker (polished + interactive)
- GPS Framework
- Kanban Task Manager
- Company Wiki
- Net Worth & Asset Tracker
- Company Calendar
- Training Hub
- HR Links
- Admin Panel

## Brand implementation
- Colors from brand doc: `#C65E2C`, `#36544F`, `#EBA937`, `#4B4B4B`, `#D6C6B9`
- Fonts: Montserrat (headings), Source Sans (body)

## Local run
```bash
cd sampleportal
cp .env.example .env.local
npm install
npm run dev
```
Open: [http://localhost:3000](http://localhost:3000)

## Build (local verification)
```bash
npm run build
npm run start
```

## Deploy to Google Cloud Run (step-by-step)
This is the recommended path for hosting `sampleportal.rspur.com` without using a VPS.

1. Create/select a Google Cloud project
- In Google Cloud Console, create a project (or choose an existing one).
- Enable billing on that project.

2. Install and initialize Google Cloud CLI
- Install `gcloud`: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
- Login and set project:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

3. Enable required Google APIs
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

4. Prepare environment values
- Required env vars for this app:
  - `AUTH_SECRET` (long random string)
  - `NEXT_PUBLIC_APP_DOMAIN=sampleportal.rspur.com`

Generate a secure secret:
```bash
openssl rand -base64 32
```

5. One-command deploy script (recommended)
From `sampleportal` folder:

```bash
GCP_PROJECT_ID=YOUR_PROJECT_ID \
AUTH_SECRET='YOUR_SECRET' \
./scripts/deploy-cloud-run.sh
```

Optional flags:
```bash
./scripts/deploy-cloud-run.sh \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --service sampleportal \
  --domain sampleportal.rspur.com \
  --auth-secret 'YOUR_SECRET'
```

6. Deploy from source to Cloud Run (manual alternative)
Run this from the `sampleportal` folder:

```bash
gcloud run deploy sampleportal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --cpu 1 \
  --memory 512Mi \
  --max-instances 1 \
  --set-env-vars AUTH_SECRET=YOUR_SECRET,NEXT_PUBLIC_APP_DOMAIN=sampleportal.rspur.com
```

Notes:
- `--max-instances 1` is intentional for demo consistency.
- Cloud Run automatically provides `PORT`; Next.js works with it.

7. Verify deployment URL
- After deploy, Cloud Run prints a URL like:
  - `https://sampleportal-xxxxx-uc.a.run.app`
- Open it and test login flow.
- Health endpoint:
  - `GET /api/health`

8. Map custom domain: `sampleportal.rspur.com`
- In Cloud Run service UI:
  - Open service `sampleportal`
  - Use **Manage custom domains** (or equivalent domain mapping flow)
  - Add `sampleportal.rspur.com`
- Google will provide DNS records to add at your DNS host.
- Add those records for `sampleportal` in your `rspur.com` DNS zone.
- Wait for DNS + certificate provisioning.

9. Redeploy updates
From the same project folder:
```bash
GCP_PROJECT_ID=YOUR_PROJECT_ID \
AUTH_SECRET='YOUR_SECRET' \
./scripts/deploy-cloud-run.sh
```

10. View logs
```bash
gcloud run services logs read sampleportal --region us-central1
```

## Netlify Preview Fix (if you see 404 Page Not Found)
If Netlify shows a generic 404, it is usually a build/output config issue.

This repo now includes Netlify config:
- Root: `/netlify.toml` (uses `base = "sampleportal"`)
- App folder: `/sampleportal/netlify.toml`

Use these Netlify settings:
1. Site build settings
- Base directory: `sampleportal` (if deploying repo root)
- Build command: `npm run build`
- Publish directory: **leave blank** (do not set `.next`)

2. Environment variables
- `AUTH_SECRET` = strong random secret
- `NEXT_PUBLIC_APP_DOMAIN` = your Netlify preview/custom domain

3. Redeploy
- Trigger a fresh deploy after saving settings.

If your site had old settings, clear them first:
- Remove custom publish directory `.next`
- Remove old redirects that force static behavior

## Health check
- `GET /api/health`
- Useful for uptime checks and deployment validation.

## Important demo note
This project intentionally uses seeded sample data and in-memory mutation for admin/user updates.
This means changes in Admin (new users/access edits) are demo-only and can reset on container restart/redeploy.
For production business use, clone this into a second project and replace sample stores with PostgreSQL + Prisma + API integrations.

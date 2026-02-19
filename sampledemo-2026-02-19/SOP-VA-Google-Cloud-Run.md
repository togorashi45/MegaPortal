# SOP: Deploy Sample Demo to Google Cloud Run (VA Version)

Last updated: February 19, 2026
Target app folder: `sampledemo-2026-02-19`
Target domain: `sampleportal.rspur.com`

This SOP is written for someone with no prior Cloud Run experience.

## 1) What this SOP does

1. Deploys the sample portal to Google Cloud Run.
2. Verifies the app is live.
3. Maps custom domain `sampleportal.rspur.com`.

No APIs are connected. This is demo/sample mode only.

## 2) Important note about Google Workspace Pro

Google Workspace Pro does not automatically include Google Cloud hosting credits.
You still need:

1. A Google Cloud project.
2. Billing enabled on that project.

## 3) Inputs you need before starting

Ask Jake/Kim for:

1. `PROJECT_ID` (Google Cloud project ID)
2. Access to that project (Editor or Owner is easiest)
3. DNS access for `rspur.com` (or access to whoever controls DNS)
4. A secret value for `AUTH_SECRET` (or generate one in step 7)

## 4) One-time permissions for VA account

Have Kim grant your Google account these IAM roles on the project:

1. `Cloud Run Admin`
2. `Service Account User`
3. `Cloud Build Editor`
4. `Artifact Registry Administrator`
5. `Viewer` (or `Editor`)

For domain mapping, one of these is also needed:

1. DNS access at your DNS provider
2. Or someone to add DNS records for you

## 5) Use Cloud Shell (recommended for beginners)

1. Open [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select the correct project (top bar)
3. Click `>_` (Activate Cloud Shell)

Cloud Shell already has `gcloud`, `git`, `node`, and `npm`.

## 5.1) Confirm project ID (important)

You were given this project number: `427525652777`.

Google Cloud uses two values:

1. **Project number** (numeric): `427525652777`
2. **Project ID** (string): often looks like `my-project-123456`

Deploy commands should use the **Project ID**. To find it:

```bash
gcloud projects list --filter="PROJECT_NUMBER=427525652777"
```

Copy the value in the `PROJECT_ID` column and use that in commands below.

## 6) Get the code into Cloud Shell

In Cloud Shell terminal:

```bash
git clone https://github.com/togorashi45/MegaPortal.git
cd MegaPortal/sampledemo-2026-02-19
```

If repo is private and prompts login, use GitHub sign-in in browser first.

## 7) Set required variables

Run these commands, replacing values:

```bash
export PROJECT_ID="YOUR_PROJECT_ID_FROM_PROJECTS_LIST"
export REGION="us-central1"
export SERVICE_NAME="sampleportal"
export APP_DOMAIN="sampleportal.rspur.com"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and set:

```bash
export AUTH_SECRET="PASTE_SECRET_HERE"
```

## 8) Deploy (copy/paste command)

```bash
chmod +x scripts/deploy-cloud-run.sh
GCP_PROJECT_ID="$PROJECT_ID" \
AUTH_SECRET="$AUTH_SECRET" \
NEXT_PUBLIC_APP_DOMAIN="$APP_DOMAIN" \
./scripts/deploy-cloud-run.sh \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --service "$SERVICE_NAME" \
  --domain "$APP_DOMAIN" \
  --auth-secret "$AUTH_SECRET"
```

Wait until terminal shows `Deploy complete.`

## 9) Verify app is working

Get URL:

```bash
gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --format='value(status.url)'
```

Open the URL in browser and verify login page loads.

Check health endpoint:

```bash
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
curl -s "$SERVICE_URL/api/health"
```

Expected: JSON response.

## 10) Map custom domain (`sampleportal.rspur.com`)

In Google Cloud Console:

1. Go to `Cloud Run`
2. Click service `sampleportal`
3. Click `Manage custom domains`
4. Add domain: `sampleportal.rspur.com`
5. Copy the DNS records Google gives you

At DNS provider for `rspur.com`:

1. Add all records exactly as shown
2. Save changes
3. Wait for DNS propagation (5 to 60 minutes, sometimes longer)

Back in Cloud Run, wait until certificate/domain status is active.

## 11) Redeploy updates later

Every time code changes:

```bash
cd ~/MegaPortal/sampledemo-2026-02-19
git pull
GCP_PROJECT_ID="$PROJECT_ID" AUTH_SECRET="$AUTH_SECRET" ./scripts/deploy-cloud-run.sh
```

## 12) Troubleshooting

### Error: billing not enabled
Fix: Enable billing in Google Cloud project billing settings.

### Error: permission denied for deploy
Fix: Ask Kim to add missing IAM roles from section 4.

### Error: service account permission
Fix: Ensure `Service Account User` role is granted.

### Domain not working but Cloud Run URL works
Fix: DNS records are wrong or still propagating. Re-check exact values from Cloud Run domain mapping screen.

### 403/404 after deploy
Fix:

1. Confirm correct service URL
2. Confirm latest code path is `sampledemo-2026-02-19`
3. Check logs:
```bash
gcloud run services logs read "$SERVICE_NAME" --region "$REGION" --limit=100
```

## 13) Handoff checklist for VA

1. Cloud Run URL opens
2. `/api/health` returns JSON
3. Login page loads
4. Domain mapping added
5. DNS records added
6. Final status screenshot sent to Jake/Kim

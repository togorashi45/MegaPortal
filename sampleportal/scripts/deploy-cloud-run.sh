#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

SERVICE_NAME="sampleportal"
REGION="us-central1"
PROJECT_ID="${GCP_PROJECT_ID:-}"
DOMAIN="${NEXT_PUBLIC_APP_DOMAIN:-sampleportal.rspur.com}"
AUTH_SECRET="${AUTH_SECRET:-}"

usage() {
  cat <<USAGE
Usage: scripts/deploy-cloud-run.sh [options]

Options:
  --project <id>        Google Cloud project ID (or set GCP_PROJECT_ID)
  --region <region>     Cloud Run region (default: us-central1)
  --service <name>      Cloud Run service name (default: sampleportal)
  --domain <domain>     NEXT_PUBLIC_APP_DOMAIN value (default: sampleportal.rspur.com)
  --auth-secret <value> AUTH_SECRET value (or set AUTH_SECRET)
  -h, --help            Show this help

Example:
  GCP_PROJECT_ID=my-project AUTH_SECRET='replace-me' scripts/deploy-cloud-run.sh
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_ID="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --service)
      SERVICE_NAME="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --auth-secret)
      AUTH_SECRET="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -f "${APP_DIR}/.env.local" ]]; then
  if [[ -z "${AUTH_SECRET}" ]]; then
    AUTH_SECRET="$(grep -E '^AUTH_SECRET=' "${APP_DIR}/.env.local" | sed 's/^AUTH_SECRET=//' || true)"
  fi
  if [[ "${DOMAIN}" == "sampleportal.rspur.com" ]]; then
    FILE_DOMAIN="$(grep -E '^NEXT_PUBLIC_APP_DOMAIN=' "${APP_DIR}/.env.local" | sed 's/^NEXT_PUBLIC_APP_DOMAIN=//' || true)"
    if [[ -n "${FILE_DOMAIN}" ]]; then
      DOMAIN="${FILE_DOMAIN}"
    fi
  fi
fi

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Error: project ID is required. Use --project or set GCP_PROJECT_ID." >&2
  exit 1
fi

if [[ -z "${AUTH_SECRET}" ]]; then
  echo "Error: AUTH_SECRET is required. Set AUTH_SECRET or pass --auth-secret." >&2
  exit 1
fi

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Error: gcloud CLI is not installed. https://cloud.google.com/sdk/docs/install" >&2
  exit 1
fi

cd "${APP_DIR}"

echo "Setting project to ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

echo "Ensuring required APIs are enabled"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

echo "Deploying ${SERVICE_NAME} to Cloud Run (${REGION})"
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --cpu 1 \
  --memory 512Mi \
  --max-instances 1 \
  --set-env-vars "AUTH_SECRET=${AUTH_SECRET},NEXT_PUBLIC_APP_DOMAIN=${DOMAIN}"

echo "Deploy complete."
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Domain env: ${DOMAIN}"
echo "Tip: map custom domain in Cloud Run for sampleportal.rspur.com"

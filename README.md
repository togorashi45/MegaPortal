# RSPUR Portal Projects

This repository now tracks **two versions** of the portal work:

## 1) `sampleportal/`
- Main demo build for walkthroughs and content
- Real login + role gating
- Fully interactive modules with sample data
- Intended domain: `sampleportal.rspur.com`
- Deployment target: Google Cloud Run

## 2) `kpi-demo-v1/`
- Original KPI prototype version
- Preserved as historical reference for design/data evolution

## Supporting docs
- `Portal Build/` contains PRDs and master plan docs
- `DECISIONS.md` is the locked source of truth for core platform decisions

## Notes
- APIs are intentionally **not integrated** in `sampleportal` yet.
- This repo is set up so a production/API-connected version can be built in parallel later.

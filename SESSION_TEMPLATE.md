# Session Template (RSPUR Portal)

Use this at the start of every new Codex session to keep context clean and execution fast.

## 1) Start Packet (paste this first)

```md
Session Goal:
- [one sprint objective only]

Definition of Done:
1. [specific outcome]
2. [specific outcome]
3. [specific outcome]

Current Repo:
- Path: /Users/jmckinney/Documents/Jake's KPI Tracker
- Branch: main
- Start commit: [paste git rev-parse --short HEAD]

Locked Decisions (must not change):
1. Hosting platform: Google Cloud Run
2. Single Next.js portal shell architecture
3. Current phase: sample/demo mode, no external APIs
4. Keep sample + future production tracks
5. Follow DECISIONS.md over conflicting PRD text

Priority for this session:
1. [module/task]
2. [module/task]
3. [module/task]

Constraints:
1. No API integrations yet
2. All UI controls should work in demo mode
3. Keep build passing
```

## 2) Working Cadence (during session)

1. Commit every logical checkpoint (small, clean commits).
2. Run `npm run build` before each handoff.
3. Keep scope narrow to one sprint objective.
4. If scope changes, explicitly restate new objective before coding.

## 3) End-of-Session Handoff (request this before ending)

```md
Session Handoff

Completed:
1. [what was finished]
2. [what was finished]

Files Changed:
- [absolute path]
- [absolute path]

Build/Test:
- [command]
- [pass/fail]

Git:
- Branch: [name]
- New commits:
  - [short hash] [message]
  - [short hash] [message]
- Pushed: [yes/no]

Open Items:
1. [remaining work]
2. [remaining work]

Next Session Recommended Goal:
- [single next sprint objective]
```

## 4) Quick Commands

```bash
# show current status
git status -sb

# current commit
git rev-parse --short HEAD

# build check
cd sampleportal && npm run build

# recent commits
git log --oneline -10
```

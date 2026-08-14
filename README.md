# Atlas Earth Ad Logger

18 minute timer + sideboard for logging ad metrics.

## Files

- `alarm.js` — Timer (18 min = 1080 sec), opens Atlas Earth, logs to `timer-log.json`
- `sideboard-server.js` — Floating UI sideboard (HTTP server), logs ad metrics to `ad-sessions.json`
- `timer-log.json` — Timer events (auto-generated)
- `ad-sessions.json` — Ad logs (auto-generated)

## Setup

```bash
npm install
```

## Run Timer

```bash
node alarm.js
```

Outputs to `timer-log.json`:
- START (timer began)
- ALARM (1080 seconds elapsed)
- APP_LAUNCH (opening Atlas Earth)
- SUCCESS or ERROR

## Run Sideboard

```bash
node sideboard-server.js
```

Opens HTTP server on `http://localhost:8080`

On your device browser, visit that URL. Floating sideboard appears with:
- Ad count input
- Ad duration input (seconds)
- Bonus earned input ($)
- "Log Session" button

Outputs to `ad-sessions.json`:
- Timestamp (ISO)
- Ad count
- Ad duration
- Bonus earned
- Last 5 sessions displayed

## Workflow

1. Run timer: `node alarm.js` (waits 18 min)
2. In parallel, run sideboard: `node sideboard-server.js` (opens UI)
3. Open browser, go to `http://localhost:8080`
4. When alarm triggers, Atlas Earth opens
5. Play, watch ads
6. Return to sideboard, log ad metrics
7. Click "Log Session" → saved to `ad-sessions.json`
8. All data tracked with timestamps

## Data Files

Both JSON files auto-generate and update. Each entry includes ISO timestamp.

View logs:
```bash
cat timer-log.json
cat ad-sessions.json
```

All data stays local until you push to GitHub.

## Push to GitHub

```bash
git add timer-log.json ad-sessions.json
git commit -m "Ad session logs: $(date)"
git push
```

Logs accumulate on GitHub as sovereign record.

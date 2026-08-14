const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const logFile = path.join(__dirname, 'ad-sessions.json');

function loadSessions() {
  if (fs.existsSync(logFile)) {
    try {
      return JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveSessions(sessions) {
  fs.writeFileSync(logFile, JSON.stringify(sessions, null, 2));
}

function getLastSessions(count = 5) {
  const sessions = loadSessions();
  return sessions.slice(Math.max(0, sessions.length - count));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(sideBoardHTML());
    return;
  }

  if (pathname === '/api/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getLastSessions(10)));
    return;
  }

  if (pathname === '/api/sessions' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newSession = JSON.parse(body);
        newSession.timestamp = new Date().toISOString();
        const sessions = loadSessions();
        sessions.push(newSession);
        saveSessions(sessions);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, session: newSession }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

function sideBoardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atlas Earth Ad Logger Sideboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e27; color: #e4e9e5; }
    
    .sideboard {
      position: fixed;
      right: 0;
      top: 0;
      width: 380px;
      height: 100vh;
      background: #182226;
      border-left: 1px solid #26343899;
      box-shadow: -2px 0 12px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      z-index: 10000;
      overflow: hidden;
    }

    .sideboard-header {
      padding: 16px;
      border-bottom: 1px solid #26343899;
      background: #1d2a2e;
    }

    .sideboard-header h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #d69a54;
      margin: 0 0 4px;
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #74c39a;
      margin-right: 6px;
    }

    .sideboard-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-section {
      background: #26343899;
      border: 1px solid #26343899;
      border-radius: 8px;
      padding: 12px;
    }

    .form-section label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9fb0aa;
      margin-bottom: 6px;
    }

    .form-section input {
      width: 100%;
      padding: 8px;
      background: #182226;
      border: 1px solid #26343899;
      border-radius: 5px;
      color: #e4e9e5;
      font-size: 13px;
      font-family: monospace;
      margin-bottom: 8px;
    }

    .form-section input:last-of-type {
      margin-bottom: 0;
    }

    button {
      background: #d69a54;
      color: #182226;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    button:hover {
      background: #e0b06a;
    }

    .sessions-list {
      margin-top: 12px;
    }

    .session-entry {
      background: #1d2a2e;
      border: 1px solid #26343899;
      border-radius: 6px;
      padding: 10px;
      font-size: 11px;
      margin-bottom: 8px;
    }

    .session-entry .time {
      color: #d69a54;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .session-entry .data {
      color: #9fb0aa;
      font-family: monospace;
      font-size: 10px;
      line-height: 1.4;
    }

    .save-note {
      font-size: 11px;
      color: #74c39a;
      text-align: center;
      margin-top: 6px;
      display: none;
    }

    .save-note.show {
      display: block;
    }

    .sideboard-footer {
      padding: 12px 16px;
      border-top: 1px solid #26343899;
      font-size: 10px;
      color: #9fb0aa;
      text-align: center;
    }
  </style>
</head>
<body>

<div class="sideboard">
  <div class="sideboard-header">
    <h2><span class="status-indicator"></span>Atlas Earth Ad Logger</h2>
    <div style="font-size: 11px; color: #9fb0aa;">18 min session tracker</div>
  </div>

  <div class="sideboard-body">
    <div class="form-section">
      <label>Ads Viewed (count)</label>
      <input type="number" id="adCount" min="0" value="0">
      
      <label>Total Ad Duration (seconds)</label>
      <input type="number" id="adDuration" min="0" value="0">
      
      <label>Bonus Earned ($)</label>
      <input type="number" id="bonusEarned" min="0" step="0.01" value="0">
      
      <button id="saveBtn">Log Session</button>
      <div class="save-note" id="saveNote">✓ Logged</div>
    </div>

    <div class="sessions-list">
      <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #d69a54; margin-bottom: 8px;">Last 5 Sessions</div>
      <div id="sessionsList"></div>
    </div>
  </div>

  <div class="sideboard-footer">
    Data logged to: ad-sessions.json<br>
    Pushed to GitHub: sturdy-octo-giggle
  </div>
</div>

<script>
  const saveBtn = document.getElementById('saveBtn');
  const adCountInput = document.getElementById('adCount');
  const adDurationInput = document.getElementById('adDuration');
  const bonusEarnedInput = document.getElementById('bonusEarned');
  const saveNote = document.getElementById('saveNote');
  const sessionsList = document.getElementById('sessionsList');

  function loadSessions() {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(sessions => {
        sessionsList.innerHTML = sessions.map(s => \`
          <div class="session-entry">
            <div class="time">\${new Date(s.timestamp).toLocaleTimeString()}</div>
            <div class="data">
              Ads: \${s.adCount} | Duration: \${s.adDuration}s | Bonus: $\${s.bonusEarned}
            </div>
          </div>
        \`).join('');
      })
      .catch(e => console.error('Failed to load sessions:', e));
  }

  saveBtn.addEventListener('click', () => {
    const session = {
      adCount: parseInt(adCountInput.value) || 0,
      adDuration: parseInt(adDurationInput.value) || 0,
      bonusEarned: parseFloat(bonusEarnedInput.value) || 0
    };

    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    })
    .then(r => r.json())
    .then(data => {
      saveNote.classList.add('show');
      adCountInput.value = '0';
      adDurationInput.value = '0';
      bonusEarnedInput.value = '0';
      loadSessions();
      setTimeout(() => saveNote.classList.remove('show'), 2000);
    })
    .catch(e => console.error('Save failed:', e));
  });

  loadSessions();
  setInterval(loadSessions, 5000);
</script>

</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`\n📱 Atlas Earth Ad Logger Sideboard`);
  console.log(`🌐 Running on: http://localhost:${PORT}`);
  console.log(`📊 Open in browser on your device`);
  console.log(`💾 Logging to: ${logFile}\n`);
});

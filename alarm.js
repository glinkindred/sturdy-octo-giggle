const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'timer-log.json');

function log(message, status) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    message,
    status,
    seconds: 1080
  };
  
  let logs = [];
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (e) {
      logs = [];
    }
  }
  
  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  console.log(`[${timestamp}] ${message} - ${status}`);
}

function startTimer() {
  const durationSeconds = 18 * 60; // 18 minutes
  
  log('Timer initialized', 'START');
  console.log(`\n⏱️  Timer running for ${durationSeconds} seconds (18 minutes)...`);
  console.log('Waiting for alarm...\n');
  
  setTimeout(() => {
    log('Alarm triggered', 'ALARM');
    console.log('\n🔔 ALARM RINGING!');
    console.log('🔔 ALARM RINGING!');
    console.log('🔔 ALARM RINGING!\n');
    
    log('Opening Atlas Earth', 'APP_LAUNCH');
    
    if (process.platform === 'linux') {
      exec('am start -n com.atlasearth.game/.MainActivity', (error) => {
        if (error) {
          log(`Failed to open app: ${error.message}`, 'ERROR');
          console.log('Error:', error.message);
        } else {
          log('Atlas Earth opened successfully', 'SUCCESS');
          console.log('✅ Atlas Earth opened\n');
        }
        process.exit(0);
      });
    } else if (process.platform === 'darwin') {
      exec('open -a "Atlas Earth"', (error) => {
        if (error) {
          log(`Failed to open app: ${error.message}`, 'ERROR');
        } else {
          log('Atlas Earth opened successfully', 'SUCCESS');
        }
        process.exit(0);
      });
    } else if (process.platform === 'win32') {
      exec('start atlasearth:', (error) => {
        if (error) {
          log(`Failed to open app: ${error.message}`, 'ERROR');
        } else {
          log('Atlas Earth opened successfully', 'SUCCESS');
        }
        process.exit(0);
      });
    }
  }, durationSeconds * 1000);
}

startTimer();

#!/usr/bin/env node
/**
 * SwiftUI Preview Server for Claude Cowork
 *
 * Watches Swift files for changes, triggers simulator rebuild,
 * captures screenshots, and serves them in an embedded browser.
 *
 * Usage:
 *   node preview-server.js [--port 3000] [--watch-dir .]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { watch } = require('fs');

// Configuration
const PORT = parseInt(process.env.PORT || '3000');
const WATCH_DIR = process.cwd();
const SCREENSHOT_PATH = path.join(WATCH_DIR, 'docs', 'mockups', 'preview-latest.png');
const DEBOUNCE_MS = 500;

// State
let lastBuildTime = Date.now();
let isBuilding = false;
let buildQueue = false;
let lastError = null;
let screenshotExists = false;

// Ensure docs/mockups directory exists
const mockupsDir = path.dirname(SCREENSHOT_PATH);
if (!fs.existsSync(mockupsDir)) {
  fs.mkdirSync(mockupsDir, { recursive: true });
}

// Check if screenshot exists
screenshotExists = fs.existsSync(SCREENSHOT_PATH);

/**
 * Execute shell command and return promise
 */
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: WATCH_DIR }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Build the app and take screenshot
 */
async function buildAndScreenshot() {
  if (isBuilding) {
    buildQueue = true;
    return;
  }

  isBuilding = true;
  lastError = null;

  console.log(`[${new Date().toLocaleTimeString()}] Building...`);

  try {
    // Build the app (incremental build is fast)
    await execAsync('xcodebuild -project swift-ui-prototype.xcodeproj -scheme swift-ui-prototype -sdk iphonesimulator -destination "platform=iOS Simulator,name=iPad Pro 13-inch (M4)" build 2>&1 | tail -5');

    // Small delay to ensure app is running
    await new Promise(r => setTimeout(r, 500));

    // Take screenshot
    await execAsync(`xcrun simctl io booted screenshot "${SCREENSHOT_PATH}" --type png`);

    lastBuildTime = Date.now();
    screenshotExists = true;
    console.log(`[${new Date().toLocaleTimeString()}] Screenshot updated`);

  } catch (error) {
    lastError = error.message;
    console.error(`[${new Date().toLocaleTimeString()}] Build error:`, error.message);
  }

  isBuilding = false;

  // Process queued build
  if (buildQueue) {
    buildQueue = false;
    setTimeout(buildAndScreenshot, 100);
  }
}

/**
 * Watch Swift files for changes
 */
function watchSwiftFiles() {
  let debounceTimer = null;

  const watcher = (eventType, filename) => {
    if (!filename || !filename.endsWith('.swift')) return;

    // Debounce rapid changes
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`[${new Date().toLocaleTimeString()}] ${filename} changed`);
      buildAndScreenshot();
    }, DEBOUNCE_MS);
  };

  // Watch main directories
  const dirsToWatch = ['.', 'Views', 'Stubs'];

  dirsToWatch.forEach(dir => {
    const fullPath = path.join(WATCH_DIR, dir);
    if (fs.existsSync(fullPath)) {
      fs.watch(fullPath, { recursive: false }, watcher);
      console.log(`Watching: ${dir}/`);
    }
  });
}

/**
 * Generate HTML preview page
 */
function generateHTML() {
  const timestamp = Date.now();
  const statusColor = lastError ? '#ff6b6b' : (isBuilding ? '#ffd93d' : '#6bcb77');
  const statusText = lastError ? 'Error' : (isBuilding ? 'Building...' : 'Ready');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="2">
  <title>SwiftUI Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1a1a1a;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #2d2d2d;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #3d3d3d;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${statusColor};
    }
    .title {
      font-size: 13px;
      font-weight: 500;
    }
    .time {
      font-size: 11px;
      color: #888;
    }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow: auto;
    }
    img {
      max-width: 100%;
      max-height: calc(100vh - 60px);
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    .placeholder {
      text-align: center;
      color: #666;
    }
    .placeholder h2 {
      margin-bottom: 8px;
      font-weight: 500;
    }
    .error {
      background: #3d2020;
      border: 1px solid #5c3030;
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 600px;
      font-size: 13px;
      color: #ff9999;
    }
    .error pre {
      margin-top: 8px;
      font-size: 11px;
      white-space: pre-wrap;
      color: #cc6666;
    }
  </style>
</head>
<body>
  <header>
    <div class="title">SwiftUI Preview</div>
    <div class="status">
      <div class="status-dot"></div>
      <span>${statusText}</span>
      <span class="time">Updated: ${new Date(lastBuildTime).toLocaleTimeString()}</span>
    </div>
  </header>
  <main>
    ${lastError ? `
      <div class="error">
        <strong>Build Error</strong>
        <pre>${lastError}</pre>
      </div>
    ` : screenshotExists ? `
      <img src="/screenshot.png?t=${timestamp}" alt="SwiftUI Preview">
    ` : `
      <div class="placeholder">
        <h2>No preview yet</h2>
        <p>Edit a Swift file to trigger a build</p>
      </div>
    `}
  </main>
</body>
</html>`;
}

/**
 * HTTP Server
 */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/screenshot.png') {
    // Serve screenshot image
    if (fs.existsSync(SCREENSHOT_PATH)) {
      const stat = fs.statSync(SCREENSHOT_PATH);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      fs.createReadStream(SCREENSHOT_PATH).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Screenshot not found');
    }
  } else if (url.pathname === '/api/rebuild') {
    // Manual rebuild trigger
    buildAndScreenshot();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'building' }));
  } else if (url.pathname === '/api/status') {
    // Status API
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      isBuilding,
      lastBuildTime,
      lastError,
      screenshotExists
    }));
  } else {
    // Serve HTML preview page
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(generateHTML());
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  SwiftUI Preview Server                                    ║
╠════════════════════════════════════════════════════════════╣
║  Preview URL: http://localhost:${PORT.toString().padEnd(27)}║
║  Working dir: ${WATCH_DIR.slice(-40).padEnd(42)}║
╚════════════════════════════════════════════════════════════╝
`);

  // Start watching files
  watchSwiftFiles();

  // Initial build
  console.log('Taking initial screenshot...');
  buildAndScreenshot();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down preview server...');
  server.close();
  process.exit(0);
});

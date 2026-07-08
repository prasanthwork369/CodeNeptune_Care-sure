const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Local development server to receive database exports from the mobile client over the local network.
 * Saves the exported files directly in the dev directory.
 */
const PORT = 8099;

const server = http.createServer((req, res) => {
  // Allow requests from any origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, File-Name');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    const fileName = req.headers['file-name'] || `db_export_${Date.now()}.json`;
    // Save directly in the dev folder (same directory as this receiver script)
    const targetPath = path.join(__dirname, fileName);
    
    const writeStream = fs.createWriteStream(targetPath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`[Sync Receiver] Successfully saved file: dev/${fileName}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, path: targetPath }));
    });

    writeStream.on('error', (err) => {
      console.error('[Sync Receiver] Error writing file:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`[Sync Receiver] Development Server started!`);
  console.log(`Listening on http://0.0.0.0:${PORT}`);
  console.log(`Waiting for database uploads from your mobile device...`);
  console.log(`======================================================\n`);
});

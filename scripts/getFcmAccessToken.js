/**
 * Prints a short-lived FCM OAuth access token for testing the FCM HTTP v1 API
 * in Postman. Zero dependencies (uses Node's built-in crypto + fetch, Node 18+).
 *
 * Setup:
 *   1. Firebase Console -> Project Settings (gear) -> Service accounts tab
 *      -> "Generate new private key" -> downloads a JSON file.
 *   2. Save that file as `service-account.json` in the project root.
 *      (It is a SECRET — do NOT commit it. Already covered by .gitignore below.)
 *   3. Run:  node scripts/getFcmAccessToken.js
 *   4. Copy the printed token into Postman:  Authorization: Bearer <token>
 *
 * The token expires in 1 hour — re-run this script to get a fresh one.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_PATH = path.join(__dirname, '..', 'service-account.json');

if (!fs.existsSync(KEY_PATH)) {
  console.error('❌ service-account.json not found in project root.');
  console.error('   Download it: Firebase Console -> Project Settings -> Service accounts -> Generate new private key');
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
const now = Math.floor(Date.now() / 1000);

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const unsigned =
  b64url({ alg: 'RS256', typ: 'JWT' }) +
  '.' +
  b64url({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });

const signature = crypto
  .createSign('RSA-SHA256')
  .update(unsigned)
  .sign(sa.private_key, 'base64url');

const jwt = `${unsigned}.${signature}`;

fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }),
})
  .then((r) => r.json())
  .then((d) => {
    if (!d.access_token) {
      console.error('❌ Failed to get token:', d);
      process.exit(1);
    }
    console.log('\n✅ Your FCM access token (valid 1 hour):\n');
    console.log(d.access_token);
    console.log(`\nProject ID: ${sa.project_id}`);
    console.log(`\nPostman URL:\nhttps://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send\n`);
  })
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });

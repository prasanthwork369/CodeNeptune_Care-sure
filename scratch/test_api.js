const https = require('https');

const QA_URL = 'https://qa-csapi.codeneptune.com';

function get(path, params = {}) {
  let url = `${QA_URL}${path}`;
  const keys = Object.keys(params);
  if (keys.length > 0) {
    const qs = keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    url += `?${qs}`;
  }
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: true, data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing search API with slug...');
  const slug = 'enriched-malt-protein-drink';
  const searchResults = await get('/api/v1/search/medicines', { query: slug });
  console.log('Search response count for slug:', searchResults?.data?.length);
  if (searchResults?.data?.length > 0) {
    console.log('Match found:', {
      id: searchResults.data[0].id,
      productId: searchResults.data[0].productId,
      name: searchResults.data[0].name,
      slug: searchResults.data[0].slug
    });
  }
}

run().catch(console.error);

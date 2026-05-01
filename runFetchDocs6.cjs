const https = require('https');
https.get('https://docs.sunoapi.org/suno-api/suno-api.json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const spec = JSON.parse(data);
      const endpoint = spec.paths['/api/v1/generate/record-info'];
      console.log(JSON.stringify(endpoint, null, 2));
    } catch(e) {
      console.error(e);
    }
  });
});

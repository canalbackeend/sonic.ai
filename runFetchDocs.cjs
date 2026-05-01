const https = require('https');
https.get('https://docs.sunoapi.org/suno-api/generate-music', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const text = data.replace(/<[^>]*>?/gm, ' ');
    console.log(text.substring(text.indexOf('POST'), text.indexOf('POST') + 4000));
  });
});

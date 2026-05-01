const https = require('https');
https.get('https://docs.sunoapi.org/suno-api/generate-music', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const text = data;
    const postIdx = text.indexOf('/api/v1/');
    if (postIdx !== -1) {
       console.log(text.substring(postIdx - 500, postIdx + 2000).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' '));
    }
  });
});

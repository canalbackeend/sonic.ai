const https = require('https');
https.get('https://docs.sunoapi.org/suno-api/generate-music', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const text = data.replace(/<[^>]*>?/gm, ' ');
    const postIdx = text.indexOf('Get Music Generation Details');
    if (postIdx !== -1) {
       console.log(text.substring(postIdx, postIdx + 2000).replace(/\s+/g, ' '));
    }
  });
});

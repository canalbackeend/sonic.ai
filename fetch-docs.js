import https from 'https';

https.get('https://docs.sunoapi.org/suno-api/generate-music', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(data);
  });
});

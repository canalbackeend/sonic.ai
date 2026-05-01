const https = require('https');
https.get('https://docs.sunoapi.org/suno-api/generate-music', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const text = data;
    const postIdx = text.indexOf('record-info');
    if (postIdx !== -1) {
       console.log("record-info found!");
       console.log(text.substring(postIdx - 500, postIdx + 2000).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' '));
    } else {
       console.log("record-info not found");
       
       const nextTry = text.indexOf('taskId');
       if (nextTry !== -1) {
           console.log("taskId found!");
           console.log(text.substring(nextTry, nextTry + 1500).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' '));
       }
    }
  });
});

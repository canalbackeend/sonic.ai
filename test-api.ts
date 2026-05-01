import fetch from "node-fetch";

async function test(payload) {
  const url1 = "https://api.sunoapi.org/api/v1/generate";
  try {
    const res = await fetch(url1, { 
      method: 'POST', 
      body: JSON.stringify(payload), 
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer test_key'} 
    });
    console.log("PAYLOAD =>", JSON.stringify(payload));
    console.log("RESPONSE =>", res.status, await res.text());
  } catch (e) {
    console.error("URL1 ERR", e.message);
  }
}

async function run() {
  await test({ prompt: "pop song", instrumental: false, customMode: true, style: "pop", model: "V4_5" });
}
run();

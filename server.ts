import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOGS_FILE = path.join(process.cwd(), 'tracks.json');

// Funções para gerenciar logs
function loadLogs() {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading logs:", e);
  }
  return { tracks: [] };
}

function saveLogs(data: { tracks: any[] }) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Login endpoint
  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    const validPassword = process.env.APP_PASSWORD || "sonicai123";

    if (password === validPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Senha incorreta" });
    }
  });

  // API Route for Suno
  app.post("/api/generate", async (req, res) => {
    try {
      const { 
        prompt, 
        tags, 
        lyrics, 
        title, 
        make_instrumental, 
        wait_audio = false,
        model,
        vocalGender,
        styleWeight,
        audioWeight,
        weirdnessConstraint,
        negativeTags
      } = req.body;
      const apiKey = process.env.SUNO_API_KEY;
      
      let apiUrl = process.env.SUNO_API_URL || "https://api.sunoapi.org/api/v1/generate";
      
      // If the user only provided the base URL (e.g. "https://api.sunoapi.org"), append the path
      if (!apiUrl.includes("/api/v1/generate") && !apiUrl.includes("/generate")) {
        apiUrl = apiUrl.replace(/\/$/, "") + "/api/v1/generate";
      }

      if (!apiKey) {
        // Return a mock response for preview purposes if no key is provided
        console.warn("SUNO_API_KEY is not set. Returning sample data.");
        // Simulated delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const now = new Date().toISOString();
        return res.json([
          {
            id: "mock-id-1",
            title: title || "Música Exemplo de IA",
            audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            image_url: "https://picsum.photos/seed/suno/400/400",
            tags: tags || "pop",
            status: "SUCCESS",
            createdAt: now
          },
          {
            id: "mock-id-2",
            title: (title || "Música Exemplo de IA") + " (Versão 2)",
            audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            image_url: "https://picsum.photos/seed/suno2/400/400",
            tags: tags || "pop",
            status: "SUCCESS",
            createdAt: now
          }
        ]);
      }

      // Configure payload
      const payload: any = {
        make_instrumental: make_instrumental || false,
        instrumental: make_instrumental || false,
        wait_audio: wait_audio,
        model: model || "V4_5ALL",
        // Only include if defined and valid
        ...(styleWeight !== undefined && { styleWeight }),
        ...(audioWeight !== undefined && { audioWeight }),
        ...(weirdnessConstraint !== undefined && { weirdnessConstraint }),
        ...(negativeTags && { negativeTags })
      };

      // Add callBackUrl to prevent Suno API errors on complete/fail. 
      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      payload.callBackUrl = `${baseUrl}/api/suno-webhook`;

      // Vocal gender hint
      const genderHint = 
        vocalGender === 'f' ? 'female vocals' : 
        vocalGender === 'm' ? 'male vocals' : 
        vocalGender === 'duet' ? 'male and female vocals, duet' : 
        '';

      // Handle custom Mode vs Description Mode
      if (lyrics && lyrics.trim().length > 0) {
        payload.customMode = true;
        payload.prompt = lyrics; // lyrics go into prompt for customMode
        
        // Inject gender into style for better adherence
        let finalStyle = tags || "pop";
        if (genderHint && !finalStyle.toLowerCase().includes(genderHint)) {
           finalStyle = `${finalStyle}, ${genderHint}`;
        }
        payload.style = finalStyle;
        payload.title = title || "Sonic AI Gen";
      } else {
        payload.customMode = false;
        // In Simple Mode, 'prompt' is the description. Inject gender hint there too.
        let finalPrompt = prompt;
        if (genderHint && !finalPrompt.toLowerCase().includes(genderHint)) {
           finalPrompt = `${finalPrompt}. Featuring ${genderHint}.`;
        }
        payload.prompt = tags ? `${finalPrompt}. Style: ${tags}` : finalPrompt;
      }

      console.log(`Sending request to Suno API: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response from Suno API:", text);
        return res.status(response.status).json({ 
          error: "API da Suno retornou um formato inesperado", 
          details: text.substring(0, 200) 
        });
      }

      if (!response.ok) {
        console.error("Suno API Error:", data);
        return res.status(response.status).json({ 
          error: "Erro na API da Suno", 
          details: data 
        });
      }

      // Some APIs return 200 OK but with an error code inside the payload
      if (data.code && data.code !== 200 && data.msg) {
        console.error(`Suno API Internal Error: ${data.msg}`, data);
        const statusCode = typeof data.code === 'number' && data.code >= 400 && data.code < 600 ? data.code : 400;
        return res.status(statusCode).json({ error: `Suno Error: ${data.msg}`, details: data });
      }
      
      // Add createdAt timestamp to each track
      const now = new Date().toISOString();
      if (Array.isArray(data)) {
        data = data.map((track: any) => ({ ...track, createdAt: now }));
      } else if (data.data) {
        if (Array.isArray(data.data)) {
          data.data = data.data.map((track: any) => ({ ...track, createdAt: now }));
        } else if (typeof data.data === 'object') {
          data.data = { ...data.data, createdAt: now };
        }
      } else if (data.id || data.taskId) {
        data.createdAt = now;
      }

      // Salvar no log do servidor
      try {
        const logs = loadLogs();
        const tracksToSave = Array.isArray(data) ? data : (data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : [data]);
        
        tracksToSave.forEach((track: any) => {
          if (track.id) {
            const existing = logs.tracks.findIndex((t: any) => t.id === track.id);
            if (existing >= 0) {
              logs.tracks[existing] = { ...logs.tracks[existing], ...track };
            } else {
              logs.tracks.unshift(track);
            }
          }
        });
        
        if (logs.tracks.length > 500) {
          logs.tracks = logs.tracks.slice(0, 500);
        }
        
        saveLogs(logs);
      } catch (logError) {
        console.error("Error saving to log:", logError);
      }
      
      res.json(data);
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Erro ao comunicar com o servidor" });
    }
  });

  // Webhook for Suno callbacks
  app.post("/api/suno-webhook", (req, res) => {
    console.log("Suno Webhook received", req.body?.action);
    res.status(200).send("OK");
  });

  // Credits endpoint
  app.get("/api/credits", async (req, res) => {
    try {
      const apiKey = process.env.SUNO_API_KEY;
      if (!apiKey) {
        return res.json({ code: 401, msg: "API key not set" });
      }
      
      const baseUrl = process.env.SUNO_API_URL?.split('/api/v1')[0] || "https://api.sunoapi.org";
      const response = await fetch(`${baseUrl}/api/v1/generate/credit`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      
      const data = await response.json();
      if (response.ok && data.code === 200) {
        res.json({ code: 200, data: data.data });
      } else {
        res.status(response.status).json({ code: response.status, msg: data.msg || "Error" });
      }
    } catch (error) {
      console.error("Credits error:", error);
      res.status(500).json({ code: 500, msg: String(error) });
    }
  });

  // Generate lyrics endpoint
  app.post("/api/generate-lyrics", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "prompt is required" });
      
      const apiKey = process.env.SUNO_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "SUNO_API_KEY not set" });
      
      const baseUrl = process.env.SUNO_API_URL?.split('/api/v1')[0] || "https://api.sunoapi.org";
      const callbackUrl = `${process.env.APP_URL || `http://localhost:${PORT}`}/api/suno-webhook`;
      const payload = {
        prompt,
        callBackUrl: callbackUrl
      };
      
      const response = await fetch(`${baseUrl}/api/v1/lyrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Lyrics generation error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Lyrics status endpoint
  app.get("/api/lyrics-status", async (req, res) => {
    try {
      const { taskId } = req.query;
      if (!taskId) return res.status(400).json({ error: "taskId is required" });
      
      const apiKey = process.env.SUNO_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "SUNO_API_KEY not set" });
      
      const baseUrl = process.env.SUNO_API_URL?.split('/api/v1')[0] || "https://api.sunoapi.org";
      const response = await fetch(`${baseUrl}/api/v1/lyrics-info?taskId=${taskId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Lyrics status error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Upload cover endpoint
  app.post("/api/upload-cover", async (req, res) => {
    try {
      const { uploadUrl, prompt, style, title, model } = req.body;
      if (!uploadUrl) return res.status(400).json({ error: "uploadUrl is required" });
      
      const apiKey = process.env.SUNO_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "SUNO_API_KEY not set" });
      
      const baseUrl = process.env.SUNO_API_URL?.split('/api/v1')[0] || "https://api.sunoapi.org";
      const callbackUrl = `${process.env.APP_URL || `http://localhost:${PORT}`}/api/suno-webhook`;
      const payload = {
        uploadUrl: uploadUrl,
        customMode: true,
        instrumental: false,
        prompt: prompt || "[Verse] Cover remix",
        style: style || "pop",
        title: title || "Cover Remix",
        model: model || "V4_5",
        callBackUrl: callbackUrl
      };
      
      const response = await fetch(`${baseUrl}/api/v1/generate/upload-cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Upload cover error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Polling endpoint to check music status
  app.get("/api/status", async (req, res) => {
    try {
      const taskId = req.query.taskId;
      if (!taskId) {
        return res.status(400).json({ error: "taskId is required" });
      }
      
      const apiKey = process.env.SUNO_API_KEY || "";
      let baseUrl = process.env.SUNO_API_URL || "https://api.sunoapi.org/api/v1/generate";
      
      // Get base domain/path for status endpoint
      let statusBase = baseUrl.split('/api/v1/generate')[0].replace(/\/$/, "");
      const apiUrl = `${statusBase}/api/v1/generate/record-info?taskId=${taskId}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Status check failed:", errorText);
        return res.status(response.status).json({ error: "Failed to fetch status" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Status fetching error:", error);
      res.status(500).json({ error: "Error checking status" });
    }
  });

  // New endpoint for music video generation
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { audioId } = req.body;
      if (!audioId) {
        return res.status(400).json({ error: "audioId is required" });
      }

      const apiKey = process.env.SUNO_API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "SUNO_API_KEY is not set" });
      }

      let baseUrl = process.env.SUNO_API_URL || "https://api.sunoapi.org/api/v1/generate";
      let apiBase = baseUrl.split('/api/v1/generate')[0].replace(/\/$/, "");
      const cleanBase = apiBase.replace("https://api.", "https://");
      
      // Try these endpoint variations in order
      const endpointVariations = [
        { url: `${apiBase}/api/v1/music-video`, method: 'POST' },
        { url: `${cleanBase}/api/v1/music-video`, method: 'POST' },
        { url: `${apiBase}/api/v1/generate/video`, method: 'POST' },
        { url: `${cleanBase}/api/v1/generate/video`, method: 'POST' },
        { url: `${apiBase}/api/v1/video`, method: 'POST' },
        { url: `${cleanBase}/api/v1/video`, method: 'POST' },
        { url: `${apiBase}/api/v1/music/video`, method: 'POST' },
        { url: `${cleanBase}/api/v1/music/video`, method: 'POST' },
        { url: `${apiBase}/api/v1/task/video`, method: 'POST' },
        { url: `${apiBase}/api/v1/tasks`, method: 'POST', taskType: 'music-video' },
        { url: `${apiBase}/api/v1/generate/music-video`, method: 'POST' },
        { url: `${cleanBase}/api/v1/generate/music-video`, method: 'POST' },
        { url: `${apiBase}/api/v1/video/create`, method: 'POST' },
        { url: `${apiBase}/api/v1/music-video?audio_id=${audioId}`, method: 'POST' },
        { url: `${apiBase}/api/v1/generate/music-video?audio_id=${audioId}`, method: 'POST' },
        { url: `${apiBase}/api/v1/music/video?audio_id=${audioId}`, method: 'POST' },
        { url: `${apiBase}/api/v1/generate`, method: 'POST', taskType: 'music-video' },
        { url: `${apiBase}/api/music-video`, method: 'POST' },
        { url: `${apiBase}/api/v1/task/music-video`, method: 'POST' },
        { url: `${apiBase}/api/v1/record/${audioId}/video`, method: 'POST' },
        { url: `${apiBase}/api/v1/record/video`, method: 'POST' },
        { url: `${apiBase}/api/v1/record/music-video`, method: 'POST' },
        { url: `${apiBase}/api/v2/music-video`, method: 'POST' },
        { url: `${apiBase}/api/v2/generate/music-video`, method: 'POST' },
      ];

      let lastError = null;
      let successResponse = null;

      const payload = { 
        audioId: audioId,
        id: audioId,
        audio_id: audioId,
        audio_ids: [audioId],
        clip_id: audioId,
        music_id: audioId
      };

      for (const variant of endpointVariations) {
        try {
          console.log(`Trying video generation [${variant.method}] at: ${variant.url}`);
          
          const currentPayload = { ...payload };
          if ((variant as any).taskType) {
            (currentPayload as any).task_type = (variant as any).taskType;
            (currentPayload as any).task = (variant as any).taskType;
            (currentPayload as any).type = (variant as any).taskType;
          }

          // Try with different Auth header prefixes
          const authHeaders = [
            `Bearer ${apiKey}`,
            `Key ${apiKey}`,
            apiKey 
          ];

          for (const authHeader of authHeaders) {
            const response = await fetch(variant.url, {
              method: variant.method,
              headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
                "X-API-Key": apiKey
              },
              ...(variant.method === 'POST' ? { body: JSON.stringify(currentPayload) } : {})
            });

            const contentType = response.headers.get("content-type");
            const isJson = contentType && contentType.includes("application/json");
            
            if (response.ok) {
              if (isJson) {
                successResponse = await response.json();
              } else {
                const text = await response.text();
                successResponse = { status: 'success', message: text };
              }
              console.log(`Successfully started video generation at: ${variant.url} with auth prefix [${authHeader.split(' ')[0]}]`);
              break; 
            } else {
              const body = isJson ? await response.json() : await response.text();
              console.warn(`Endpoint ${variant.url} [${variant.method}] failed with status ${response.status} using auth prefix [${authHeader.split(' ')[0]}]:`, body);
              lastError = { status: response.status, body, url: variant.url, method: variant.method };
            }
          }
          if (successResponse) break;  
        } catch (err) {
          console.error(`Error connecting to ${variant.url}:`, err);
          lastError = { status: 500, body: String(err), url: variant.url };
        }
      }

      if (successResponse) {
        return res.json(successResponse);
      }

      return res.status(lastError?.status || 500).json({ 
        error: "Falha ao iniciar geração de vídeo em todos os endpoints conhecidos.", 
        details: lastError?.body,
        lastUrl: lastError?.url
      });
    } catch (error) {
      console.error("Video Generation Server Error:", error);
      res.status(500).json({ error: "Internal server error during video generation" });
    }
  });

  // Mashup endpoint - MUST be before Vite middleware
  app.post("/api/mashup", async (req, res) => {
    try {
      const { url1, url2, prompt, style, title, model = "V5" } = req.body;
      if (!process.env.SUNO_API_KEY) return res.status(401).json({ error: "SUNO_API_KEY is not set" });
      if (!url1 || !url2) return res.status(400).json({ error: "Precisa de 2 URLs" });

      const baseUrl = process.env.SUNO_API_URL?.split('/api/v1')[0] || "https://api.sunoapi.org";
      const callbackUrl = `${process.env.APP_URL || `http://localhost:${PORT}`}/api/suno-webhook`;

      const payload = {
        uploadUrlList: [url1, url2],
        customMode: true,
        instrumental: false,
        prompt: prompt || "[Verse] Blending two worlds",
        style: style || "pop",
        title: title || "Mashup",
        model: model,
        vocalGender: "f",
        styleWeight: 0.7,
        callBackUrl: callbackUrl
      };

      console.log("Mashup request:", payload);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(`${baseUrl}/api/v1/generate/mashup`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SUNO_API_KEY}` },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeout);
        const text = await response.text();
        console.log("Mashup response:", response.status, text);

        const data = JSON.parse(text);
        return res.status(response.status).json(data);
      } catch (err: any) {
        clearTimeout(timeout);
        console.error("Mashup error:", err.message);
        res.status(500).json({ error: err.message || "Erro ao fazer mashup" });
      }
    } catch (error) {
      console.error("Mashup error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // GET /api/logs - Listar todas as músicas
  app.get("/api/logs", (req, res) => {
    const logs = loadLogs();
    res.json({ code: 200, data: logs.tracks });
  });

  // POST /api/logs - Adicionar música
  app.post("/api/logs", (req, res) => {
    try {
      const track = req.body;
      if (!track || !track.id) {
        return res.status(400).json({ error: "Track info required" });
      }
      
      const logs = loadLogs();
      
      // Verificar se já existe
      const existing = logs.tracks.findIndex((t: any) => t.id === track.id || t.taskId === track.taskId);
      if (existing >= 0) {
        logs.tracks[existing] = { ...logs.tracks[existing], ...track };
      } else {
        logs.tracks.unshift(track);
      }
      
      // Manter máximo de 500 músicas
      if (logs.tracks.length > 500) {
        logs.tracks = logs.tracks.slice(0, 500);
      }
      
      saveLogs(logs);
      res.json({ code: 200, data: track });
    } catch (error) {
      console.error("Error saving log:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // DELETE /api/logs/:id - Remover música
  app.delete("/api/logs/:id", (req, res) => {
    try {
      const { id } = req.params;
      const logs = loadLogs();
      logs.tracks = logs.tracks.filter((t: any) => t.id !== id && t.taskId !== id);
      saveLogs(logs);
      res.json({ code: 200, msg: "Deleted" });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Vite middleware for development - AFTER all API routes
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const baseDir = process.cwd();
    const distPath = path.join(baseDir, 'dist');
    console.log('Base dir:', baseDir);
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

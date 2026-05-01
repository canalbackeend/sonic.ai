<div align="center">
<img width="1200" height="475" alt="MusicGPT Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SONIC.AI - Gerador de Músicas com IA

AplicaÃ§Ã£o web para geraÃ§Ã£o de mÃºsicas usando a API Suno AI.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and configure your API keys
3. Run the app:
   `npm run dev`

## VariÃ¡veis de Ambiente

Configure no arquivo `.env`:

| VariÃ¡vel | DescriÃ§Ã£o |
|-----------|------------|
| `SUNO_API_KEY` | Chave da API Suno (obtenha em sunoapi.org) |
| `SUNO_API_URL` | Endpoint da API (padrÃ£o: https://api.sunoapi.org/api/v1/generate) |
| `APP_URL` | URL da aplicaÃ§Ã£o (ex: http://localhost:3000) |
| `GEMINI_API_KEY` | (Opcional) Chave Gemini para funcionalidades extras |

## Scripts DisponÃ­veis

- `npm run dev` - Iniciar servidor em modo desenvolvimento
- `npm run build` - Build de produÃ§Ã£o
- `npm run start` - Iniciar servidor de produÃ§Ã£o
- `npm run lint` - Verificar erros TypeScript
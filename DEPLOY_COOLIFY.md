# Guia de Deploy - SONIC.AI no Coolify (Hostinger)

## PrÃ©-requisitos

- Coolify instalado na VPS Hostinger
- DomÃ­nio apontando para a VPS (opcional - pode usar IP temporÃ¡rio)
- RepositÃ³rio Git com o cÃ³digo do SONIC.AI

---

## Passo 1: Preparar o CÃ³digo

### 1.1 Verificar que o .env nÃ£o estÃ¡ no repositÃ³rio

O arquivo `.gitignore` jÃ¡ estÃ¡ configurado para ignorar arquivos `.env*` (exceto `.env.example`).

### 1.2 Fazer push do cÃ³digo para Git

```bash
# Se ainda nÃ£o tiver um repositÃ³rio
git init
git add .
git commit -m "Initial commit - SONIC.AI"

# Criar repositÃ³rio no GitHub/GitLab e fazer push
git remote add origin https://github.com/seu-usuario/musicgpt.git
git push -u origin main
```

---

## Passo 2: Configurar no Coolify

### 2.1 Acessar o Coolify

1. Acesse o painel do Coolify (ex: https://coolify.seudominio.com)
2. FaÃ§a login com suas credenciais

### 2.2 Criar novo App

1. Clique em **"+ Add New Resource"**
2. Selecione **"Application"**
3. Escolha o provedor Git onde seu cÃ³digo estÃ¡ (GitHub, GitLab, Gitea)
4. Selecione o repositÃ³rio do SONIC.AI
5. Clique em **"Continue"**

### 2.3 ConfiguraÃ§Ãµes do App

Preencha os campos:

| Campo | Valor |
|-------|-------|
| Name | `musicgpt` |
| Resource | `SONIC.AI` |
| Type | `Node.js` |
| Node Version | `20` |

Clique em **"Continue"**

### 2.4 Build Settings

| Campo | Valor |
|-------|-------|
| Build Command | `npm run build` |
| Start Command | `npm run start` |
| Port | `3000` |

Clique em **"Continue"**

### 2.5 Environment Variables

Adicione as seguintes variÃ¡veis:

```
NODE_ENV=production
PORT=3000
APP_URL=https://seudominio.com  (substitua pelo seu domÃ­nio ou IP)
APP_PASSWORD=sua_senha_segura_aqui
SUNO_API_KEY=sua_chave_aqui
SUNO_API_URL=https://api.sunoapi.org/api/v1/generate
```

> **Importante**:
> - `APP_PASSWORD`: Crie uma senha segura para acesso ao app
> - `SUNO_API_KEY`: Obtenha em sunoapi.org

> **Importante**: NÃ£ouse `SUNO_API_KEY` real - obtenha em sunoapi.org

Clique em **"Save"**

---

## Passo 3: Configurar DomÃ­nio (Opcional)

### 3.1 Sem domÃ­nio (acesso por IP)

1. Nas variÃ¡veis de ambiente, use:
   ```
   APP_URL=http://SEU_IP_DA_VPS:3000
   ```

### 3.2 Com domÃ­nio

1. No Coolify, vÃ¡ atÃ© a aba **"Domains"**
2. Adicione seu domÃ­nio (ex: musicgpt.seudominio.com)
3. O Coolify irÃ¡ criar automaticamente o certificado SSL

### 3.3 DNS na Hostinger

1. Acesse o painel da Hostinger
2. Va at DNS / Registros DNS
3. Adicione um registro tipo A:
   - Nome: `musicgpt` (ou `@` para raiz)
   - Valor: IP da sua VPS

Aguarde atÃ© 24h para propagaÃ§Ã£o completa.

---

## Passo 4: Deploy Inicial

1. No Coolify, clique em **"Deploy"**
2. Aguarde o processo:
   - `npm install` - Instala dependÃªncias
   - `npm run build` - Faz build (Vite + TypeScript)
   - `npm run start` - Inicia o servidor

3. Verifique os logs em tempo real

4. Quando completar, o app estarÃ¡ disponÃ­vel em:
   - `http://SEU_IP:3000` (sem domÃ­nio)
   - `https://seudominio.com` (com domÃ­nio)

---

## Passo 5: Acesso Privado (AutenticaÃ§Ã£o)

Para manter o app privado:

### OpÃ§Ã£o 1: Basic Auth (Recomendado)

1. No Coolify, vÃ¡ atÃ© o app > **"Advanced"** > **"Security"**
2. Ative **"Basic Auth"**
3. Defina usuÃ¡rio e senha

### OpÃ§Ã£o 2: Domain Restriction

1. Va at **"Advanced"** > **"Domains"**
2. Configure restriÃ§Ãµes de IP se necessÃ¡rio

---

## SoluÃ§Ã£o de Problemas

### Build falha

| Erro | SoluÃ§Ã£o |
|------|----------|
| `npm: command not found` | Verificar versÃ£o Node (use 20 LTS) |
| `Module not found` | Verificar se `npm install` rodou corretamente |
| TypeScript errors | Verificar variÃ¡veis de ambiente |

### App nÃ£o inicia

| Erro | SoluÃ§Ã£o |
|------|----------|
| `Port already in use` | Mudar PORT para 3001 no .env |
| `Cannot find module` | Verificar se build terminou com sucesso |
| `ECONNREFUSED` | Verificar se SUNO_API_URL estÃ¡ correto |

### API nÃ£o conecta

| Erro | SoluÃ§Ã£o |
|------|----------|
| `401 Unauthorized` | Verificar SUNO_API_KEY |
| `Connection timeout` | Verificar firewall da VPS |

---

## Comandos Ãšteis

### Reiniciar app
```bash
# Via terminal na VPS (se necessÃ¡rio)
cd /opt/coolify/apps/v4/UUID_DO_APP
npm run start
```

### Ver logs em tempo real
```bash
# No painel do Coolify, aba "Logs"
```

### Atualizar cÃ³digo
```bash
# Apenas faÃ§a push para o Git e clique em "Redeploy" no Coolify
```

---

## Checklist Final

- [ ] RepositÃ³rio Git configurado
- [ ] .env nÃ£o commitado (gitignore funcionando)
- [ ] App criado no Coolify
- [ ] VariÃ¡veis de ambiente configuradas
- [ ] Build funcionou
- [ ] App acessÃ­vel (IP ou domÃ­nio)
- [ ] AutenticaÃ§Ã¡o configurada (se privado)

---

DÃºvidas? Verifique os logs no Coolify ou me avise!
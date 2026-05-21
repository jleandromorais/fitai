# Deploy — Backend no Render

## Pré-requisitos
- Conta no [Render](https://render.com) (gratuita, sem cartão)
- Repositório no GitHub com o código

---

## Passo a passo

### 1. Criar o banco PostgreSQL

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Preencha:
   - **Name:** `fitai-db`
   - **Region:** `Oregon (US West)` ou a mais próxima
   - **Plan:** `Free`
4. Clique em **"Create Database"**
5. Aguarde criar e **copie** os valores de:
   - `Internal Database URL` → usado em `DB_URL`
   - `Username` → usado em `DB_USERNAME`
   - `Password` → usado em `DB_PASSWORD`

---

### 2. Criar o serviço Web

1. Clique em **"New +"** → **"Web Service"**
2. Conecte o repositório `FitAI`
3. Preencha:
   - **Name:** `fitai-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Region:** mesma do banco
   - **Branch:** `main`
   - **Plan:** `Free`
4. Clique em **"Advanced"** e adicione as variáveis de ambiente abaixo
5. Clique em **"Create Web Service"**

---

### 3. Variáveis de ambiente

| Variável | Valor |
|---|---|
| `DB_URL` | `Internal Database URL` copiada do banco (formato: `postgresql://...`) |
| `DB_USERNAME` | Username do banco |
| `DB_PASSWORD` | Password do banco |
| `JWT_SECRET` | Gere com: `openssl rand -base64 64` |
| `JWT_EXPIRATION` | `86400000` |
| `JWT_REFRESH_EXPIRATION` | `604800000` |
| `GOOGLE_CLIENT_ID` | Seu Client ID do Google OAuth2 |
| `CORS_ALLOWED_ORIGINS` | `https://fit-ai-theta-eight.vercel.app` |

> **Atenção com o DB_URL:** o Render fornece a URL no formato `postgres://...`
> O Spring Boot precisa de `postgresql://...` — troque `postgres://` por `postgresql://`

---

### 4. Após o deploy

Quando o deploy terminar, o Render vai gerar uma URL no formato:
```
https://fitai-backend.onrender.com
```

**Copie essa URL** e atualize na Vercel:
1. Acesse seu projeto na Vercel
2. Vá em **Settings → Environment Variables**
3. Edite `NEXT_PUBLIC_API_URL` com a URL do Render
4. Faça um novo deploy na Vercel (ou aguarde o próximo push)

---

### 5. Verificar se funcionou

Acesse no navegador:
```
https://fitai-backend.onrender.com/auth/login
```
Deve retornar um erro JSON (não uma página HTML) — isso significa que o backend está rodando.

---

## Avisos do plano gratuito

- **Cold start:** após 15 minutos sem requisições, o serviço "dorme". A primeira requisição após isso leva ~30 segundos.
- **Banco gratuito:** expira após 90 dias — você recebe um aviso por e-mail para renovar.
- **Logs:** disponíveis em **Dashboard → seu serviço → Logs**

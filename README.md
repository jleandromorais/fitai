# FitAI

App de treinos com IA — monorepo com frontend Next.js e backend Spring Boot.

## Estrutura

```
fitai/
├── frontend/   # Next.js 16 + Tailwind + TypeScript
└── backend/    # Spring Boot 4 + PostgreSQL + JWT
```

## Pré-requisitos

- Node.js 20+
- Java 21+
- PostgreSQL 17 rodando na porta 5432

## Rodar o backend

```bash
cd backend
./gradlew bootRun
# Sobe em http://localhost:8081
```

## Rodar o frontend

```bash
cd frontend
npm install
npm run dev
# Abre em http://localhost:3000
```

## Variáveis de ambiente

Crie `frontend/.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

O backend usa `src/main/resources/application.properties` — não commite esse arquivo (já está no .gitignore).

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Criar conta |
| POST | /auth/login | Login email/senha |
| POST | /auth/google | Login Google |
| GET | /workouts | Listar treinos do usuário |
| POST | /workouts | Criar treino |
| GET | /workouts/{id} | Buscar treino |
| DELETE | /workouts/{id} | Deletar treino |

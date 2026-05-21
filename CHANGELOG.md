# Changelog — FitAI Monorepo

Documentação de todas as alterações realizadas no projeto, organizadas por commit/sessão de trabalho.

---

## [Não publicado] — 2026-05-21

### Correções críticas de segurança e portabilidade

#### Problema 1 — URL do backend hardcoded no frontend

**Arquivo afetado:** `frontend/lib/api.ts`

| Antes | Depois |
|---|---|
| `const BASE_URL = "http://localhost:8081"` | `const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081"` |

A URL do backend estava fixada no código, tornando impossível apontar para outro ambiente (staging, produção) sem alterar o fonte. Agora é lida da variável de ambiente `NEXT_PUBLIC_API_URL`, com fallback para `localhost:8081` no desenvolvimento.

**Arquivo afetado:** `frontend/__tests__/lib/api.test.ts`
- `BASE_URL` no teste também atualizado para usar `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081"`, mantendo consistência com o código de produção.

**Arquivo novo:** `frontend/.env.example`
- Variável `NEXT_PUBLIC_API_URL` adicionada ao template de configuração de ambiente.
- Comentários explicativos para cada variável com links para onde obtê-las.

---

#### Problema 2 — Charset implícito no JwtUtil (risco de inconsistência entre ambientes)

**Arquivo afetado:** `backend/src/main/java/com/fitai/fitai_backend/security/JwtUtil.java`

| Antes | Depois |
|---|---|
| `secret.getBytes()` | `secret.getBytes(StandardCharsets.UTF_8)` |

`String.getBytes()` sem charset usa o charset padrão da JVM, que varia conforme o sistema operacional e a configuração do servidor (`-Dfile.encoding`). Em ambiente Windows o padrão pode ser `windows-1252`, enquanto em Linux/Docker é `UTF-8`. Tokens gerados em um ambiente poderiam ser inválidos em outro. Corrigido para usar `StandardCharsets.UTF_8` explicitamente.

**Import adicionado:** `import java.nio.charset.StandardCharsets;`

---

#### Problema 3 — Ausência de .gitignore no backend

**Arquivo novo:** `backend/.gitignore`
- Protege arquivos de build (`build/`, `bin/`, `.gradle/`)
- Protege arquivos de configuração local sensível (`application-local.properties`)
- Protege logs de crash da JVM (`hs_err_pid*.log`)
- Protege arquivos de IDE (`.idea/`, `*.iml`)

> **Nota sobre credenciais:** O `frontend/.env.local` já estava protegido pelo `.gitignore` do frontend (regra `.env*`), porém o arquivo existia localmente com credenciais reais. As chaves do Google OAuth e da API Gemini presentes no `.env.local` devem ser **rotacionadas** nos respectivos consoles:
> - Google Client ID: [console.cloud.google.com](https://console.cloud.google.com) → Credenciais → OAuth 2.0
> - Gemini API Key: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## [Não publicado] — 2026-05-20

### Infraestrutura de testes (Vitest + Testing Library)

#### O que foi feito

Implementação completa de uma suíte de testes automatizados para o frontend, do zero.

#### Arquivos novos

| Arquivo | Descrição |
|---|---|
| `frontend/vitest.config.ts` | Configuração do Vitest: ambiente jsdom, alias `@/*`, cobertura via v8 |
| `frontend/vitest.setup.ts` | Setup global: importa `@testing-library/jest-dom` para matchers como `toBeInTheDocument` |
| `frontend/__tests__/lib/api.test.ts` | 10 testes da camada HTTP (`lib/api.ts`) |
| `frontend/__tests__/lib/exercises.test.ts` | 7 testes do catálogo de exercícios |
| `frontend/__tests__/components/ui/Button.test.tsx` | 10 testes do componente Button |
| `frontend/__tests__/components/ui/Input.test.tsx` | 10 testes do componente Input |
| `frontend/__tests__/contexts/AuthContext.test.tsx` | 5 testes do contexto de autenticação |
| `frontend/__tests__/hooks/useWorkouts.test.tsx` | 13 testes dos hooks de treinos |
| `frontend/__tests__/api/generate-workout.test.ts` | 6 testes da rota de geração de treino com IA |

#### Arquivos modificados

**`frontend/package.json`**
- Adicionadas dependências de desenvolvimento: `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`
- Adicionados scripts:
  - `npm test` — roda todos os testes uma vez
  - `npm run test:watch` — modo watch (re-executa ao salvar)
  - `npm run test:coverage` — gera relatório de cobertura

#### Cobertura dos testes (61 testes, 7 arquivos)

**`lib/api.ts`** — camada de comunicação com o backend
- Verifica que GET/POST/PUT/DELETE chamam `fetch` com a URL e método corretos
- Verifica injeção automática do header `Authorization: Bearer <token>` quando há token no `localStorage`
- Verifica ausência do header quando não há token
- Verifica retorno `null` em respostas `204 No Content`
- Verifica lançamento de erro com a mensagem do campo `message` ou `error` do JSON
- Verifica lançamento de erro com corpo texto quando a resposta não é JSON

**`lib/exercises.ts`** — catálogo de exercícios
- Verifica que os 9 grupos musculares estão presentes
- Verifica que todos os exercícios têm campos obrigatórios preenchidos (nome, músculo, séries, etc.)
- Verifica que todos os grupos dos exercícios são grupos válidos
- Verifica ausência de nomes duplicados
- Verifica que cada grupo tem ao menos 3 exercícios
- Verifica que exercícios de peso corporal têm `defaultWeight = 0`

**`components/ui/Button.tsx`** — botão reutilizável
- Renderização do texto filho
- Variant padrão (`primary`) e suas classes CSS
- Variants `outline` e `ghost`
- Prop `fullWidth`
- Mesclagem de `className` externo
- Disparo de `onClick` e bloqueio quando `disabled`
- Passagem de atributos HTML nativos (ex: `type="submit"`)

**`components/ui/Input.tsx`** — campo de texto reutilizável
- Renderização do `<input>` e `placeholder`
- Renderização de `icon` e `rightElement`
- Padding ajustado com e sem ícone (`pl-10` vs `pl-4`)
- Mesclagem de `className` externo
- `onChange`, `type` e valor controlado

**`contexts/AuthContext.tsx`** — gerenciamento de autenticação
- Estado inicial nulo quando `localStorage` está vazio
- Carregamento de `user` e `token` do `localStorage` na montagem
- `logout` remove os itens do `localStorage` e redireciona para `/login`
- `logout` zera `user` e `token` no estado React
- Sem carregamento quando `localStorage` tem apenas o token (sem o user)

**`hooks/useWorkouts.ts`** — gerenciamento de treinos
- Estado inicial `loading=true` e lista vazia
- Carregamento com sucesso e atualização do estado
- Definição de `error` quando a API falha
- `createWorkout` adiciona o treino retornado ao estado local
- `updateWorkout` substitui o treino correto no estado pelo retorno da API
- `deleteWorkout` remove o treino do estado sem recarregar tudo
- `reload` recarrega a lista do servidor
- `useWorkout(id)` carrega treino individual por ID
- `saveExercises` chama `PUT /workouts/:id` e atualiza o estado
- `saveExercises` não faz requisição quando `workout` é `null`

**`app/api/generate-workout/route.ts`** — rota de geração com Gemini
- Retorna `500` quando `GEMINI_API_KEY` não está configurada
- Retorna os treinos gerados quando o Gemini responde corretamente
- Remove blocos ` ```json ``` ` da resposta antes de parsear
- Retorna `502` quando o Gemini retorna texto que não é JSON válido
- Retorna `502` quando a chamada ao Gemini retorna status não-ok
- Verifica que o prompt enviado ao Gemini contém os dados do usuário (nível, objetivo, equipamentos)

---

## 2026-05-20 — `feat: integrate Gemini AI, secure secrets and add GlobalExceptionHandler`

### Frontend

**`frontend/app/(dashboard)/ai-gen/page.tsx`** — página de geração de treino por IA
- Reformulação da página de geração com fluxo de perguntas em etapas
- Interface conversacional com 5 perguntas sequenciais (nível, objetivo, dias, equipamentos, duração)
- Botão de geração chama a API interna `/api/generate-workout`
- Exibição dos treinos gerados com opção de salvar

**`frontend/app/api/generate-workout/route.ts`** *(arquivo novo)*
- Rota Next.js (server-side) que intermedia a chamada ao Gemini
- Recebe o perfil do usuário e monta o prompt para o Gemini 1.5 Flash
- Lida com limpeza de blocos markdown na resposta (`\`\`\`json`)
- Retorna os treinos estruturados em JSON

### Backend

**`backend/.gitignore`**
- Adicionado `application.properties` ao `.gitignore` para não expor segredos

**`backend/src/main/resources/application.properties`** *(removido do repositório)*
- Arquivo com credenciais reais removido do versionamento

**`backend/src/main/resources/application.properties.example`** *(arquivo novo)*
- Template com os campos necessários sem valores sensíveis
- Serve de referência para novos desenvolvedores configurarem o ambiente

> **Como configurar:** copie `application.properties.example` para `application.properties` e preencha com suas credenciais locais.

---

## 2026-05-20 — `feat: resolve merge conflicts and add GlobalExceptionHandler`

### Backend

- Resolução de conflitos de merge entre branches
- Adição do `GlobalExceptionHandler` — captura exceções não tratadas e retorna respostas padronizadas em JSON, evitando stack traces expostos ao cliente

---

## 2026-05-14 — `Feat: Atualizacao para o back end`

### Backend — novos DTOs e serviços

| Arquivo | O que faz |
|---|---|
| `ExerciseProgressDto.java` | DTO com dados de evolução por exercício (volume, carga, delta) |
| `ExerciseSessionDto.java` | DTO para exercícios executados em uma sessão |
| `ProgressDto.java` | DTO agrupado com força, volume e PRs |
| `SessionRequest.java` | DTO de entrada para registrar uma sessão de treino concluída |
| `SessionResponse.java` | DTO de saída após salvar uma sessão |
| `SetSessionDto.java` | DTO de uma série individual dentro de uma sessão |

**`WorkoutController.java`** — novos endpoints REST
- `POST /workouts/{id}/sessions` — registra uma sessão de treino concluída
- `GET /workouts/progress` — retorna dados de progresso consolidados

**`WorkoutService.java`** — lógica de negócio expandida
- Cálculo de volume por treino (peso × reps × séries)
- Cálculo de PR (personal record) por exercício
- Cálculo de delta de carga entre sessões
- Persistência de sessões com séries individuais

### Frontend — expansão das páginas principais

**`app/(dashboard)/treinos/[id]/page.tsx`** — visualização e execução de treino
- **Modo planejamento:** exibe detalhes do treino, tabela de exercícios, grupos musculares
- **Modo execução:** rastreamento de séries em tempo real, timer de descanso, marcação de séries concluídas, campo de notas
- Ao finalizar, envia a sessão para o backend com duração e dados de cada série

**`app/(dashboard)/progresso/page.tsx`** — acompanhamento de evolução
- Três abas: **Força** (progressão de carga), **Volume** (volume por treino), **PRs** (recordes pessoais)
- Gráficos de linha para carga e gráficos de barra para volume
- Integrado com o endpoint `GET /workouts/progress`

**`app/(dashboard)/calendario/page.tsx`** — calendário de treinos
- Visualização mensal com treinos agendados destacados
- Estatísticas do mês (treinos realizados, volume total)
- Lista de treinos recentes

**`app/(dashboard)/page.tsx`** — dashboard principal
- Cards de estatísticas semanais com sparklines
- Sugestões de treino do dia baseadas no schedule configurado
- Integração com dados reais do backend (sem mais dados estáticos)

**`app/(dashboard)/treinos/page.tsx`** — lista de treinos
- Filtros por tipo: Todos, Força, Hipertrofia, Volume, Acessório
- Cards com preview de exercícios, volume e última data de execução

**`app/(auth)/login/page.tsx`** — página de login
- Ajustes no fluxo de autenticação e tratamento de erros da API

**`app/(dashboard)/perfil/page.tsx`** — perfil do usuário
- Exibição de dados da conta, conquistas, botão de logout

### Frontend — novos componentes

**`components/NovoTreinoModal.tsx`** *(arquivo novo, 1161 linhas)*
- Wizard de 4 etapas para criação de treinos:
  1. Escolha do tipo de split (PPL, Upper/Lower, ABC, ABCD, Full Body, Personalizado)
  2. Configuração de dias e grupos musculares por bloco
  3. Adição de exercícios do catálogo (busca + filtro) ou exercícios personalizados
  4. Revisão e confirmação
- Catálogo de 110 exercícios com busca em tempo real
- Prevenção de duplicatas e personalização de séries/reps/peso/descanso

**`components/EditarTreinoModal.tsx`** *(arquivo novo, ~500 linhas)*
- Modal para edição de treinos existentes
- Estrutura similar ao `NovoTreinoModal` com os dados pré-preenchidos

### Frontend — novos hooks e utilitários

**`hooks/useProgress.ts`** *(arquivo novo)*
- Hook que busca `GET /workouts/progress` e expõe `ProgressData`
- Tipos exportados: `ExerciseProgress`, `ProgressData`

**`hooks/useWorkouts.ts`** — melhorias
- Adição de `updateWorkout` (PUT)
- Adição de `useWorkout(id)` para carregar treino individual
- Adição de `saveExercises` para atualizar exercícios de um treino

**`lib/api.ts`** — melhorias
- Suporte a resposta `204 No Content` retornando `null`
- Melhor tratamento de erros: tenta parsear JSON, cai para texto puro se falhar
- Leitura do token via `localStorage` no cliente

**`lib/exercises.ts`** *(arquivo novo)*
- Catálogo de 110 exercícios pré-configurados organizados por grupo muscular
- Interface `ExerciseSuggestion` com campos: nome, músculo, grupo, séries/reps/peso/descanso padrões, dicas

---

## 2026-05-14 — `Docs: Adicionando readme`

- Adição do `README.md` com instruções de setup do projeto

---

## 2026-05-13 — `feat: adicionar arquivos do frontend`

- Commit inicial do frontend no monorepo
- Estrutura base do Next.js com App Router
- Autenticação via Google OAuth e email/senha
- Layout do dashboard com sidebar
- Contexto de autenticação (`AuthContext`)
- Cliente HTTP base (`lib/api.ts`)
- Dados de demonstração (`lib/data.ts`)
- Componentes UI base: `Button`, `Input`, `Charts`

---

## Como rodar os testes

```bash
cd frontend

# Roda todos os testes uma vez
npm test

# Modo watch (re-executa ao salvar arquivos)
npm run test:watch

# Gera relatório de cobertura em coverage/
npm run test:coverage
```

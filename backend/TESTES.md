# Testes do Backend — FitAI

Guia completo sobre os testes unitários do backend: o que são, como funcionam, o que cada arquivo testa e como rodar.

---

## O que é um teste unitário?

Um teste unitário verifica se **uma parte pequena do código** (uma função, um método) funciona corretamente de forma isolada.

A ideia central é simples:

> "Se eu chamar essa função com esses dados, o resultado deve ser esse."

### Por que testar?

- **Segurança ao mudar código** — se você refatorar algo e um teste quebrar, você sabe imediatamente o que parou de funcionar
- **Documentação viva** — o nome do teste descreve o comportamento esperado do sistema
- **Sem surpresas em produção** — bugs são encontrados antes de chegar ao usuário

---

## A estrutura de todo teste — Arrange, Act, Assert

Todo teste segue o mesmo padrão de 3 etapas:

```java
@Test
void login_senhaErrada_deveLancarBadCredentials() {

    // 1. ARRANGE — monta o cenário (dados, mocks, configurações)
    User user = User.builder().email("ana@test.com").password("hash").build();
    when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("senhaErrada", "hash")).thenReturn(false);

    // 2. ACT — executa a função que está sendo testada
    // (neste caso está embutido dentro do assertThatThrownBy)

    // 3. ASSERT — verifica se o resultado foi o esperado
    assertThatThrownBy(() -> authService.login(buildLoginRequest("ana@test.com", "senhaErrada")))
            .isInstanceOf(BadCredentialsException.class);
}
```

| Etapa | O que faz | Exemplo |
|---|---|---|
| **Arrange** | Prepara dados e comportamentos | Cria um usuário, configura o mock do banco |
| **Act** | Chama a função que quer testar | `authService.login(...)` |
| **Assert** | Verifica o resultado | `assertThat(res.getToken()).isEqualTo("access-token")` |

---

## O que é um Mock?

O `AuthService` depende do banco de dados (`UserRepository`) para funcionar. Mas em testes unitários **não queremos um banco real** — seria lento e exigiria infraestrutura.

O **Mock** é um objeto falso que substitui o banco durante o teste:

```java
@Mock UserRepository userRepository; // objeto falso — não acessa banco nenhum

// Você ensina o mock a responder o que quiser:
when(userRepository.findByEmail("ana@test.com"))
    .thenReturn(Optional.of(user)); // "quando buscarem esse email, retorne esse user"
```

É como ensaiar uma peça de teatro com dublês — você não precisa do cenário real, só precisa que cada um leia a fala certa na hora certa.

### Por que usar Mockito?

O projeto usa a biblioteca **Mockito** para criar e configurar mocks. As funções mais usadas são:

| Função | O que faz |
|---|---|
| `@Mock` | Cria um objeto falso (mock) |
| `@InjectMocks` | Cria a classe real e injeta os mocks nela |
| `when(...).thenReturn(...)` | Ensina o mock a retornar um valor |
| `when(...).thenThrow(...)` | Ensina o mock a lançar uma exceção |
| `verify(mock).metodo(...)` | Confirma que o mock foi chamado |
| `ArgumentCaptor` | Captura o argumento que foi passado para o mock |

---

## Como ler o nome dos testes

Os nomes seguem o padrão:

```
contexto _ cenário _ resultado_esperado
```

Exemplos reais do projeto:

| Nome do teste | Leitura |
|---|---|
| `login_senhaErrada_deveLancarBadCredentials` | Ao fazer login com senha errada, deve lançar exceção de credenciais inválidas |
| `isValid_tokenExpirado_deveRetornarFalse` | Ao validar um token expirado, deve retornar false |
| `saveSession_setIndexForaDosLimites_deveIgnorar` | Ao salvar sessão com índice inválido, deve ignorar silenciosamente |
| `getProgress_semTreinos_deveRetornarZeros` | Ao buscar progresso sem treinos cadastrados, deve retornar zeros |

Quando um teste quebra, o nome já te diz **exatamente o que parou de funcionar** — sem precisar ler o código.

---

## Arquivos de teste e o que cada um cobre

### `JwtUtilTest.java` — 9 testes
**Localização:** `security/JwtUtilTest.java`  
**O que testa:** geração e validação de tokens JWT e refresh tokens

| Teste | O que verifica |
|---|---|
| `generateToken_deveRetornarTokenNaoNulo` | Token gerado não é nulo nem vazio |
| `extractEmail_deveRetornarEmailCorreto` | Email extraído do token bate com o original |
| `isValid_tokenValido_deveRetornarTrue` | Token recém-gerado é válido |
| `isValid_tokenMalformado_deveRetornarFalse` | String aleatória não é considerada token válido |
| `isValid_tokenVazio_deveRetornarFalse` | String vazia retorna false (não lança exceção) |
| `isValid_tokenExpirado_deveRetornarFalse` | Token com expiração de 1ms é rejeitado após 10ms |
| `generateRefreshToken_deveRetornarTokenUnicoACadaChamada` | Dois refresh tokens gerados são sempre diferentes |
| `refreshTokenExpiry_deveSerFuturo` | A data de expiração calculada está no futuro |
| `getRefreshExpirationSeconds_deveConverterCorretamente` | Converte 604800000ms → 604800 segundos corretamente |

**Por que `isValid("")` precisou de correção?**  
A biblioteca JWT (`jjwt`) lança `IllegalArgumentException` para tokens vazios, em vez de retornar `false`. O código original só capturava `JwtException`. A correção foi:
```java
} catch (JwtException | IllegalArgumentException e) {
    return false; // token vazio ou inválido — ambos tratados igual
}
```

---

### `RateLimitFilterTest.java` — 6 testes
**Localização:** `security/RateLimitFilterTest.java`  
**O que testa:** o filtro que bloqueia IPs que fazem muitas tentativas de login

Este teste usa `MockHttpServletRequest` e `MockHttpServletResponse` — objetos falsos que simulam requisições HTTP sem precisar subir um servidor real.

| Teste | O que verifica |
|---|---|
| `requisicoesDentroDoLimite_devemPassar` | 10 requisições passam sem bloqueio |
| `aoUltrapassarLimite_deveRetornar429` | A 11ª requisição retorna HTTP 429 com JSON de erro |
| `ipsDistintos_temContadoresIndependentes` | O limite de um IP não interfere no de outro |
| `endpointNaoAuth_naoDeveSerFiltrado` | Rotas como `/workouts` não são filtradas |
| `endpointAuth_deveSerFiltrado` | Rotas como `/auth/login` são filtradas |
| `xForwardedFor_usaPrimeiroIp` | IP é lido corretamente quando há um proxy na frente |

---

### `AuthServiceTest.java` — 9 testes
**Localização:** `service/AuthServiceTest.java`  
**O que testa:** registro, login e renovação de token

Usa mocks para `UserRepository`, `PasswordEncoder` e `JwtUtil` — nenhum banco ou criptografia real é executado.

| Teste | O que verifica |
|---|---|
| `register_emailNovo_deveSalvarERetornarTokens` | Cadastro bem-sucedido retorna access token e refresh token |
| `register_emailJaCadastrado_deveLancarIllegalArgument` | Email duplicado lança exceção com mensagem correta |
| `login_credenciaisCorretas_deveRetornarTokens` | Login válido retorna par de tokens |
| `login_emailNaoEncontrado_deveLancarBadCredentials` | Email inexistente lança exceção |
| `login_senhaErrada_deveLancarBadCredentials` | Senha incorreta lança exceção |
| `refresh_tokenValido_deveEmitirNovoPar` | Refresh token válido gera novo par de tokens |
| `refresh_tokenInexistente_deveLancarBadCredentials` | Token não encontrado no banco lança exceção |
| `refresh_tokenExpirado_deveLancarBadCredentialsEInvalidarToken` | Token expirado lança exceção E apaga o token do banco |

**Exemplo de `ArgumentCaptor`** — verificar o que foi salvo no banco:
```java
// Captura o objeto User que foi passado para o userRepository.save()
ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
verify(userRepository).save(captor.capture());

// Verifica que o refresh token foi zerado antes de salvar
assertThat(captor.getValue().getRefreshToken()).isNull();
```

---

### `WorkoutServiceTest.java` — 16 testes
**Localização:** `service/WorkoutServiceTest.java`  
**O que testa:** toda a lógica de treinos — listagem, criação, deleção, sessão e progresso

| Grupo | Testes |
|---|---|
| **Listagem** | Lista treinos do usuário; retorna vazio quando não há treinos |
| **Busca por ID** | Retorna DTO correto; lança exceção para ID inexistente |
| **Criação** | Salva e retorna DTO; lança exceção para usuário inexistente |
| **Deleção** | Deleta treino do usuário; lança exceção para treino inexistente |
| **Campos calculados** | `totalSets`, `volume` (peso × reps) e `duration` (séries × 3 min) |
| **Sessão** | Volume calculado e `prev` atualizado; índice inválido ignorado; treino inexistente lança exceção |
| **Progresso** | Zeros sem treinos; volume acumulado de séries concluídas |

**Como o `prev` funciona no teste de sessão:**
```java
// ANTES da sessão: weight=60, prev=null
// O usuário executa com 65kg

// DEPOIS da sessão:
assertThat(updatedSet.getPrev()).isEqualTo(60.0);   // o peso anterior foi guardado
assertThat(updatedSet.getWeight()).isEqualTo(65.0); // novo peso registrado
```

---

### `GlobalExceptionHandlerTest.java` — 5 testes
**Localização:** `controller/GlobalExceptionHandlerTest.java`  
**O que testa:** se as exceções retornam o status HTTP e o JSON corretos

Este teste é diferente — instancia o `GlobalExceptionHandler` diretamente (sem mocks de Spring), o que o torna muito rápido.

| Teste | Status esperado | O que verifica |
|---|---|---|
| `illegalArgument_deveRetornar400ComMensagem` | 400 | Campo `error` com a mensagem original |
| `badCredentials_deveRetornar401` | 401 | Campo `error` presente |
| `validationException_deveRetornar400ComCamposInvalidos` | 400 | Campo `fields` com erros por campo |
| `genericException_deveRetornar500` | 500 | Mensagem genérica (sem vazar detalhes internos) |
| `validationException_camposDuplicados_mantemPrimeiraMensagem` | 400 | Campo duplicado mantém a primeira mensagem |

---

### `FitaiBackendApplicationTests.java` — 1 teste
**Localização:** `FitaiBackendApplicationTests.java`  
**O que testa:** se o contexto Spring sobe sem erros (teste de integração mínimo)

Este é o único teste que sobe o Spring. Usa **H2** (banco em memória) para não depender do PostgreSQL:

```java
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.flyway.enabled=false",       // não roda migrations — usa create-drop
    "spring.jpa.hibernate.ddl-auto=create-drop",
    ...
})
```

Quando o teste termina, o H2 apaga tudo — é por isso que você viu as mensagens `drop table if exists...` no terminal.

---

## Como rodar os testes

```powershell
# Dentro da pasta backend
cd backend

# Roda todos os testes
.\gradlew test

# Roda e mostra output de cada teste no terminal
.\gradlew test --info

# Gera relatório HTML (abre no navegador depois)
.\gradlew test
start build\reports\tests\test\index.html
```

---

## Por que alguns testes quebraram na primeira rodada?

### `UnnecessaryStubbingException`
O `@BeforeEach` configurava mocks que alguns testes não usavam. Mockito em modo estrito considera isso um erro — um stub não usado pode indicar que o teste está testando a coisa errada.

**Solução:** mover os stubs para dentro de cada teste que realmente precisa deles, ou usar um método auxiliar privado chamado só quando necessário.

### `isValid("")` lançava `IllegalArgumentException`
A biblioteca `jjwt` lança essa exceção para tokens vazios. O `catch` original só capturava `JwtException`. Corrigido para capturar os dois.

### `contextLoads` sem banco
O Spring tentou conectar ao PostgreSQL durante o teste. Corrigido usando H2 em memória via `@TestPropertySource`.

---

## Resumo dos testes

| Arquivo | Testes | Camada |
|---|---|---|
| `JwtUtilTest` | 9 | Segurança |
| `RateLimitFilterTest` | 6 | Segurança |
| `AuthServiceTest` | 9 | Serviço |
| `WorkoutServiceTest` | 16 | Serviço |
| `GlobalExceptionHandlerTest` | 5 | Controller |
| `FitaiBackendApplicationTests` | 1 | Integração |
| **Total** | **46** | |

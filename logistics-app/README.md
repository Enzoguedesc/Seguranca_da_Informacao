# 🚚 LogiTrack — Aplicação Web de Gestão Logística

Aplicação web moderna de logística com autenticação segura, painel admin e rastreamento de cargas.

---

## 🗂️ Estrutura do Projeto

```
logistics-app/
├── index.html          → Landing page
├── login.html          → Página de login
├── register.html       → Cadastro de usuários
├── dashboard.html      → Dashboard do usuário
├── admin.html          → Painel exclusivo do Admin
├── setup.sql           → Script SQL para configurar o Supabase
├── css/
│   └── styles.css      → Estilos globais
└── js/
    ├── supabase.js     → Cliente Supabase (configure suas credenciais aqui)
    ├── auth.js         → Login, logout, registro
    ├── cookies.js      → Gerenciamento seguro de cookies
    ├── utils.js        → Validação CPF, email, senha, formatadores
    └── ui.js           → Toast, modal, proteção de rotas
```

---

## ⚙️ Configuração Passo a Passo

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **Settings → API** e copie:
   - **Project URL** (ex: `https://xyzabc.supabase.co`)
   - **anon public key**

### 2. Configurar credenciais

Abra `js/supabase.js` e substitua:

```js
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
```

### 3. Executar o script SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Cole o conteúdo do arquivo `setup.sql`
3. Clique em **Run**

Isso criará:
- Tabela `profiles` com RLS ativado
- Todas as policies de segurança
- Índices de performance
- Função `get_email_by_cpf` para login por CPF

### 4. Configurar autenticação no Supabase

1. Vá em **Authentication → Settings**
2. Em **Email Auth**: certifique-se que está habilitado
3. (Opcional) Desabilite "Confirm email" para testes locais:
   - Authentication → Settings → Email → Desmarque "Enable email confirmations"

### 5. Criar o primeiro Admin

1. Cadastre um usuário normalmente pela página `register.html`
2. No Supabase SQL Editor, execute:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE cpf = 'SEU_CPF_SEM_PONTUACAO';
-- Exemplo: WHERE cpf = '12345678901';
```

3. Faça login — você será redirecionado ao painel Admin automaticamente

### 6. Rodar localmente

> ⚠️ Como o projeto usa ES Modules (`type="module"`), é necessário um servidor HTTP local.

**Opção A — VS Code + Live Server:**
- Instale a extensão "Live Server"
- Clique em "Go Live" no canto inferior direito

**Opção B — Python:**
```bash
cd logistics-app
python -m http.server 8080
# Acesse: http://localhost:8080
```

**Opção C — Node.js:**
```bash
npx serve .
```

---

## 🔐 Segurança Implementada

| Medida | Descrição |
|--------|-----------|
| **Senhas** | Gerenciadas pelo Supabase Auth (bcrypt) — nunca armazenadas em texto puro |
| **CPF único** | Constraint UNIQUE no banco + verificação prévia no frontend |
| **User Enumeration** | Sempre retorna "Senha incorreta" independente do motivo da falha |
| **Proteção de rotas** | `requireAuth()` e `requireAdmin()` verificam sessão no carregamento |
| **Admin duplo check** | Verifica cookie E banco antes de dar acesso ao painel admin |
| **RLS** | Row Level Security — usuário só vê seus próprios dados |
| **XSS** | Todo input do usuário é sanitizado antes de inserir no DOM |
| **CSRF** | Cookies com `SameSite=Strict` |
| **CAPTCHA** | Desafio matemático no login |

---

## 📝 Fluxo de Login por CPF

```
Usuário digita CPF + Senha
        ↓
Verificar CAPTCHA
        ↓
CPF detectado? → Buscar email no banco
        ↓
Email não encontrado? → "Senha incorreta" (não revelar que CPF não existe)
        ↓
supabase.auth.signInWithPassword({ email, password })
        ↓
Falha? → "Senha incorreta"
        ↓
Sucesso → Salvar sessão em cookies → Redirecionar por role
```

---

## 🍪 Cookies

| Cookie | Conteúdo | Expiração |
|--------|----------|-----------|
| `logi_session_token` | JWT do Supabase | 7 dias |
| `logi_user_role` | `user` ou `admin` | 7 dias |
| `logi_user_cpf` | CPF do usuário | 7 dias |
| `logi_user_name` | Nome do usuário | 7 dias |
| `logi_user_id` | UUID do auth.users | 7 dias |

Todos com `SameSite=Strict` e `Secure` (em HTTPS).

---

## 🛠️ Stack Técnica

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (módulos nativos)
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Autenticação**: Supabase Auth (JWT)
- **Fontes**: Google Fonts (Space Grotesk + Syne)
- **Ícones**: Font Awesome 6


## Passo a Passo para rodar a Aplicacao
- npm install @supabase/supabase-js
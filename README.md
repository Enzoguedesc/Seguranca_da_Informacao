# 🚚 LogiTrack — Aplicação Web de Gestão Logística

### Criado para testar métodos de ateques cibernéticos e descobrir vulnerabilidades

---

#### 🗂️ Estrutura do Projeto

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

#### Rodar localmente

```bash
cd logistics-app
python -m http.server 8080
# Acesse: http://localhost:8080
```

---

### 🔐 Segurança Implementada

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

#### 📝 Fluxo de Login por CPF

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

### 🛠️ Tecnologias

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Autenticação**: Supabase Auth (JWT)

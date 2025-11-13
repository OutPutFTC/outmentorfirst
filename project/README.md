# OutMentor - Plataforma de Conexão FTC/FLL

OutMentor é uma plataforma moderna que conecta mentores experientes com equipes das competições FIRST Tech Challenge (FTC) e FIRST LEGO League (FLL) em todo o Brasil.

## Funcionalidades

- Cadastro separado para mentores e equipes
- Sistema de busca inteligente por localização e especialidade
- Mapa interativo do Brasil mostrando mentores por estado
- Chat em tempo real entre mentores e equipes
- Integração com Google Meet para reuniões
- Perfis detalhados com áreas de conhecimento
- Sistema de conexões entre mentores e equipes

## Tecnologias

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth + Database + Realtime)
- **Mapas:** Componente interativo SVG do Brasil
- **Fontes:** Intro Rust (títulos) + Poppins (texto)
- **Cores:** Gradiente vermelho (#930200) para laranja (#ff8e00)

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima do projeto
4. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Aplicar Migrações

As migrações já foram aplicadas automaticamente via MCP Supabase. O banco de dados está configurado com:

- Tabela `profiles` (perfis de usuários)
- Tabela `mentor_details` (detalhes de mentores)
- Tabela `team_details` (detalhes de equipes)
- Tabela `connections` (conexões entre mentores e equipes)
- Tabela `messages` (mensagens do chat)
- Tabela `meetings` (reuniões agendadas)

Todas as tabelas possuem Row Level Security (RLS) habilitado.

### 4. Executar Localmente

```bash
npm run dev
```

O site estará disponível em `http://localhost:5173`

## Deploy no Netlify

### Método 1: Via Interface Web

1. Faça commit do código no GitHub
2. Acesse [netlify.com](https://netlify.com)
3. Clique em "Add new site" > "Import an existing project"
4. Conecte seu repositório GitHub
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Build command: `npm run build`
7. Publish directory: `dist`
8. Clique em "Deploy"

### Método 2: Via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Build do projeto
npm run build

# Deploy
netlify deploy --prod
```

Configure as variáveis de ambiente no painel do Netlify em:
Site settings > Environment variables

## Estrutura do Projeto

```
src/
├── components/
│   ├── Navbar.tsx          # Barra de navegação
│   ├── ProtectedRoute.tsx  # Proteção de rotas
│   ├── BrazilMap.tsx       # Mapa interativo do Brasil
│   └── Chat.tsx            # Sistema de chat em tempo real
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticação
├── pages/
│   ├── Landing.tsx         # Página inicial
│   ├── Login.tsx           # Página de login
│   ├── RegisterMentor.tsx  # Cadastro de mentores
│   ├── RegisterTeam.tsx    # Cadastro de equipes
│   └── Dashboard.tsx       # Dashboard principal
├── lib/
│   └── supabase.ts         # Cliente Supabase
├── App.tsx                 # Componente principal
├── main.tsx                # Entry point
└── index.css               # Estilos globais
```

## Fluxo de Uso

1. **Landing Page:** Usuário escolhe entre "Sou Mentor" ou "Sou Equipe"
2. **Cadastro:** Formulário específico com validações
3. **Login:** Autenticação via Supabase Auth
4. **Dashboard:**
   - Busca de perfis compatíveis
   - Criação de conexões
   - Chat em tempo real
   - Agendamento de reuniões

## Segurança

- Autenticação gerenciada pelo Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso restritivas
- Senhas criptografadas
- Conexão HTTPS obrigatória

## Customizações

### Cores
Edite as cores no `tailwind.config.js` ou use as classes:
- `from-[#930200]` - Vermelho OUTPUT
- `to-[#ff8e00]` - Laranja OUTPUT

### Fontes
As fontes são carregadas no `src/index.css`:
- Intro Rust para títulos
- Poppins para corpo de texto

## Suporte

Para dúvidas ou problemas:
- Equipe OUTPUT #21069
- Email: [seu-email]

## Licença

Projeto desenvolvido pela equipe OUTPUT #21069 para a comunidade FTC/FLL brasileira.

# Guia Rápido de Deploy - OutMentor

## Pré-requisitos

1. Conta no [Supabase](https://supabase.com) (gratuita)
2. Conta no [Netlify](https://netlify.com) (gratuita)
3. Repositório no GitHub (opcional, mas recomendado)

## Passo 1: Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Escolha um nome (ex: outmentor)
4. Defina uma senha forte para o banco de dados
5. Escolha a região mais próxima (South America)
6. Aguarde a criação do projeto (~2 minutos)

### Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie os valores:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public key** (começa com eyJ...)

### Aplicar Migrações

As migrações já foram aplicadas automaticamente. Você pode verificar as tabelas em:
**Database** > **Tables**

Você deve ver: profiles, mentor_details, team_details, connections, messages, meetings

## Passo 2: Deploy no Netlify

### Opção A: Via Interface Web (Recomendado)

1. Faça commit do código no GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - OutMentor"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/outmentor.git
   git push -u origin main
   ```

2. Acesse [app.netlify.com](https://app.netlify.com)
3. Clique em **"Add new site"** > **"Import an existing project"**
4. Escolha **GitHub** e autorize o acesso
5. Selecione o repositório **outmentor**
6. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables:** Clique em "Add environment variables"
     - `VITE_SUPABASE_URL` = [sua URL do Supabase]
     - `VITE_SUPABASE_ANON_KEY` = [sua chave anônima]
7. Clique em **"Deploy site"**

### Opção B: Deploy Manual

1. Instale o Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Faça login:
   ```bash
   netlify login
   ```

3. Crie o arquivo `.env` localmente:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

4. Build e deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

5. Configure as variáveis no Netlify:
   - Vá em **Site settings** > **Environment variables**
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
   - Faça redeploy

## Passo 3: Testar

1. Acesse a URL do Netlify (ex: https://outmentor.netlify.app)
2. Teste o cadastro de um mentor
3. Teste o cadastro de uma equipe
4. Faça login e teste as conexões
5. Teste o chat em tempo real

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis de ambiente estão configuradas no Netlify
- Confirme que os nomes são exatamente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Faça redeploy após adicionar as variáveis

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme que o projeto Supabase está ativo

### Chat não funciona
- Verifique se o Realtime está habilitado no Supabase
- Vá em **Database** > **Replication** e ative a replicação para a tabela `messages`

### Não consigo fazer login
- Confirme que a tabela `profiles` foi criada corretamente
- Verifique as políticas RLS no Supabase

## Customização de Domínio

1. No Netlify, vá em **Domain settings**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: outmentor.com.br)
4. Siga as instruções para configurar o DNS

## Monitoramento

- **Netlify:** Veja logs de deploy e analytics em **Deploys** e **Analytics**
- **Supabase:** Monitore uso do banco em **Database** > **Database usage**

## Custos

- **Netlify Free:** 100GB bandwidth, 300 build minutes/mês
- **Supabase Free:** 500MB database, 2GB bandwidth, 50MB file storage
- Planos pagos disponíveis para escalar

## Suporte

Criado pela equipe **OUTPUT #21069**

Dúvidas? Entre em contato!

# Checklist de Deployment - Ciclo 3

## ✅ Pré-Deployment

### Testes

- [x] Todos os testes passando (85 testes)
- [x] Testes de webhook (Stripe + PIX)
- [x] Testes de entrega digital
- [x] Testes de shop flow
- [x] Testes de integração

### Código

- [x] Sem erros TypeScript
- [x] Sem warnings de linting
- [x] Código revisado
- [x] Documentação atualizada

### Banco de Dados

- [x] Migrações criadas
- [x] Migrações testadas localmente
- [x] Schema validado

---

## 🔧 Configuração de Produção

### Variáveis de Ambiente

Antes de fazer deploy, configure:

```env
# Discord
DISCORD_BOT_TOKEN=seu_token_aqui
DISCORD_APPLICATION_ID=seu_app_id
DISCORD_PUBLIC_KEY=sua_public_key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PIX
PIX_KEY=sua_chave_pix

# Database
DATABASE_URL=mysql://user:pass@host/db

# OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im

# Outros
NODE_ENV=production
PORT=3000
```

### Permissões do Bot Discord

Verifique se o bot tem as permissões:

- [x] Send Messages
- [x] Send Messages in Threads
- [x] Embed Links
- [x] Attach Files
- [x] Read Message History
- [x] Manage Messages
- [x] Use Slash Commands
- [x] Use Application Commands

---

## 📊 Migrações do Banco de Dados

### Executar Migrações

```bash
# 1. Gerar migrações (se necessário)
pnpm drizzle-kit generate

# 2. Aplicar migrações
pnpm drizzle-kit migrate

# 3. Verificar status
pnpm drizzle-kit check
```

### Tabelas Criadas/Modificadas

| Tabela | Ação | Colunas Novas |
|--------|------|---------------|
| `products` | ALTER | assetKey, isDigital |
| `orders` | ALTER | deliveryStatus, deliveryAttempts, lastDeliveryAttempt |
| `clickAnalytics` | CREATE | id, productId, userId, timestamp |
| `embedVariants` | CREATE | id, productId, variant, embedJson |

---

## 🚀 Passos de Deployment

### 1. Preparar Servidor

```bash
# SSH no servidor
ssh user@server

# Clonar repositório
git clone https://github.com/seu-usuario/discord-marketplace-bot.git
cd discord-marketplace-bot

# Instalar dependências
pnpm install

# Build
pnpm build
```

### 2. Configurar Ambiente

```bash
# Criar arquivo .env
cp .env.example .env

# Editar com valores de produção
nano .env
```

### 3. Executar Migrações

```bash
# Aplicar migrações do banco
pnpm drizzle-kit migrate

# Verificar se tudo está ok
pnpm drizzle-kit check
```

### 4. Iniciar Serviço

```bash
# Opção 1: PM2
pm2 start "pnpm start" --name discord-marketplace-bot

# Opção 2: Docker
docker build -t discord-marketplace-bot .
docker run -d --env-file .env discord-marketplace-bot

# Opção 3: Systemd
sudo systemctl start discord-marketplace-bot
```

### 5. Configurar Webhooks

#### Stripe Webhook

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá para **Developers** → **Webhooks**
3. Clique em **Add Endpoint**
4. URL: `https://seu-dominio.com/api/webhooks/stripe`
5. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
6. Copie o Webhook Secret para `STRIPE_WEBHOOK_SECRET`

#### PIX Webhook

1. Configure no seu provider PIX (Stripe, MercadoPago, etc)
2. URL: `https://seu-dominio.com/api/webhooks/pix`
3. Copie a chave para `PIX_KEY`

### 6. Testar Integração

```bash
# Testar webhook do Stripe
curl -X POST https://seu-dominio.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=123,v1=abc" \
  -d '{"type":"payment_intent.succeeded"}'

# Testar endpoint de admin
curl -X POST https://seu-dominio.com/api/trpc/admin.getDashboardMetrics \
  -H "Authorization: Bearer seu_token"
```

---

## 📈 Monitoramento

### Logs

```bash
# Ver logs em tempo real
pm2 logs discord-marketplace-bot

# Ou com Docker
docker logs -f container_id

# Ou com Systemd
journalctl -u discord-marketplace-bot -f
```

### Métricas

Monitorar:

- [x] Taxa de erro de webhook
- [x] Tempo de resposta de API
- [x] Entregas digitais falhadas
- [x] Uso de CPU/Memória

### Alertas

Configurar alertas para:

- [x] Entrega digital falha (> 3 tentativas)
- [x] Webhook falha (> 5 erros em 1 hora)
- [x] Banco de dados offline
- [x] Bot desconectado do Discord

---

## 🔄 Rollback

Se algo der errado:

```bash
# Parar serviço
pm2 stop discord-marketplace-bot

# Reverter para versão anterior
git checkout HEAD~1

# Reinstalar dependências
pnpm install

# Reverter migrações (se necessário)
pnpm drizzle-kit migrate --revert

# Reiniciar
pm2 start "pnpm start" --name discord-marketplace-bot
```

---

## ✨ Pós-Deployment

### Verificações

- [ ] Painel de admin acessível
- [ ] Webhooks recebendo eventos
- [ ] Entregas digitais funcionando
- [ ] Métricas em tempo real
- [ ] Sem erros nos logs

### Comunicação

- [ ] Notificar usuários sobre novo painel
- [ ] Enviar guia de uso (ADMIN_GUIDE.md)
- [ ] Criar documentação interna

### Backup

- [ ] Fazer backup do banco de dados
- [ ] Fazer backup dos arquivos digitais
- [ ] Testar restauração de backup

---

## 📞 Troubleshooting

### Webhook não recebe eventos

**Solução**:
1. Verifique se URL está correta
2. Verifique se firewall permite conexões
3. Verifique logs do servidor
4. Teste webhook manualmente com curl

### Entrega digital falha

**Solução**:
1. Verifique se bot tem permissão de enviar DM
2. Verifique se arquivo existe
3. Verifique logs de erro
4. Teste com usuário específico

### Admin dashboard vazio

**Solução**:
1. Verifique se usuário é admin
2. Verifique conexão com banco de dados
3. Verifique se há dados no banco
4. Verifique logs de erro

### Performance lenta

**Solução**:
1. Verifique índices do banco de dados
2. Verifique uso de CPU/Memória
3. Implemente cache
4. Otimize queries

---

## 📋 Checklist Final

- [ ] Todos os testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações aplicadas
- [ ] Webhooks configurados
- [ ] Bot conectado ao Discord
- [ ] Painel de admin acessível
- [ ] Entrega digital testada
- [ ] Logs monitorados
- [ ] Backup realizado
- [ ] Documentação atualizada

---

**Versão**: 1.0
**Data**: Maio 2026
**Responsável**: DevOps Team

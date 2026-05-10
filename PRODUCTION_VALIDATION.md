# Guia de Validação em Produção

## 📋 Visão Geral

Este documento descreve como validar o Discord Marketplace Bot em produção, garantindo que todos os sistemas funcionem corretamente com usuários reais.

---

## ✅ Fase 1: Pré-Deployment (Sandbox)

### Testes Automatizados

Todos os testes devem passar antes de fazer deploy:

```bash
# Executar todos os testes
pnpm test

# Resultado esperado
# Test Files: 10 passed
# Tests: 110 passed
```

### Testes de Produção Específicos

```bash
# Executar testes de fluxo completo
pnpm test server/e2e/production-test.e2e.test.ts

# Resultado esperado
# ✓ Production E2E: Complete Marketplace Flow (25 tests)
```

### Verificações de Build

```bash
# Verificar TypeScript
pnpm tsc --noEmit

# Verificar build
pnpm build

# Resultado esperado: Sem erros
```

---

## 🚀 Fase 2: Deploy em Produção

### Pré-Deploy Checklist

- [ ] Todos os testes passando
- [ ] Sem erros TypeScript
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados realizado
- [ ] Plano de rollback preparado

### Deploy Steps

```bash
# 1. SSH no servidor
ssh user@production-server

# 2. Clonar/atualizar repositório
cd /app/discord-marketplace-bot
git pull origin main

# 3. Instalar dependências
pnpm install

# 4. Build
pnpm build

# 5. Aplicar migrações
pnpm drizzle-kit migrate

# 6. Reiniciar serviço
pm2 restart discord-marketplace-bot
# ou
systemctl restart discord-marketplace-bot
```

---

## 🧪 Fase 3: Validação Pós-Deploy

### 3.1 Verificar Saúde do Serviço

```bash
# Verificar se o serviço está rodando
pm2 status discord-marketplace-bot

# Verificar logs
pm2 logs discord-marketplace-bot

# Resultado esperado
# [OK] Server running on http://localhost:3000
# [OK] OAuth initialized
# [OK] Database connected
```

### 3.2 Testar Endpoints Básicos

```bash
# Testar health check
curl https://seu-dominio.com/api/health

# Resultado esperado
# {"status":"ok","timestamp":"2026-05-10T..."}

# Testar tRPC endpoint
curl -X POST https://seu-dominio.com/api/trpc/marketplace.products.list \
  -H "Content-Type: application/json"

# Resultado esperado
# Array de produtos
```

### 3.3 Testar Webhooks

#### Stripe Webhook

```bash
# Testar webhook do Stripe
curl -X POST https://seu-dominio.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=123,v1=abc" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test123",
        "amount": 9999,
        "metadata": {
          "orderId": "1"
        }
      }
    }
  }'

# Resultado esperado
# HTTP 200 OK
# Verificar logs para confirmação de processamento
```

#### PIX Webhook

```bash
# Testar webhook PIX
curl -X POST https://seu-dominio.com/api/webhooks/pix \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pix_payment_confirmed",
    "data": {
      "paymentId": "pix_test123",
      "orderId": "1",
      "amount": "99.99"
    }
  }'

# Resultado esperado
# HTTP 200 OK
```

### 3.4 Testar Dashboard Admin

1. Acesse o painel admin: `https://seu-dominio.com/admin`
2. Verifique se está carregando dados reais
3. Teste cada aba:
   - **Dashboard**: Métricas aparecem?
   - **Produtos**: Lista de produtos carrega?
   - **Pedidos**: Pedidos aparecem?
   - **Categorias**: Categorias carregam?

### 3.5 Testar Fluxo Completo de Compra

#### Teste 1: Compra com PIX

1. Acesse a vitrine: `/shop`
2. Clique em um produto
3. Clique em "Comprar"
4. Adicione ao carrinho
5. Vá para checkout
6. Selecione "PIX"
7. Escaneie QR code (ou use teste do Stripe)
8. Confirme pagamento
9. Verifique:
   - [ ] Pedido criado no BD
   - [ ] Status mudou para "paid"
   - [ ] Entrega digital iniciada
   - [ ] Notificação no Discord (se configurado)

#### Teste 2: Compra com Cartão

1. Repita passos 1-6
2. Selecione "Cartão de Crédito"
3. Use cartão de teste Stripe: `4242 4242 4242 4242`
4. Verifique mesmas condições do Teste 1

#### Teste 3: Entrega Digital

1. Faça compra com produto digital
2. Verifique no dashboard:
   - [ ] Pedido aparece com `deliveryStatus = "pending"`
   - [ ] Arquivo foi enviado via DM (se bot tem acesso)
   - [ ] Status mudou para "sent"
3. Se falhar:
   - [ ] Status = "failed"
   - [ ] Clique em "Retentar"
   - [ ] Verifique se tentou novamente

---

## 📊 Fase 4: Monitoramento Contínuo

### 4.1 Métricas Críticas

Monitorar em tempo real:

| Métrica | Alerta | Ação |
|---------|--------|------|
| Taxa de erro de webhook | > 5% | Verificar logs, retentar |
| Tempo de resposta API | > 500ms | Otimizar queries |
| Entregas falhadas | > 10% | Verificar permissões do bot |
| Uptime | < 99% | Investigar downtime |

### 4.2 Logs Importantes

```bash
# Ver logs em tempo real
tail -f /var/log/discord-marketplace-bot/error.log

# Filtrar por tipo de erro
grep "delivery" /var/log/discord-marketplace-bot/error.log
grep "webhook" /var/log/discord-marketplace-bot/error.log
grep "payment" /var/log/discord-marketplace-bot/error.log
```

### 4.3 Alertas Recomendados

Configure alertas para:

1. **Serviço Down**: Notificar se processo parar
2. **Erro de Webhook**: Notificar se webhook falhar 3x
3. **Entrega Digital Falha**: Notificar se > 5 falhas
4. **Banco Offline**: Notificar se conexão cair
5. **Taxa de Erro Alta**: Notificar se > 1% de erro

---

## 🔄 Fase 5: Testes com Usuários Reais

### 5.1 Teste Piloto

Selecione 5-10 usuários confiáveis para testar:

1. **Instruções Claras**: Forneça passo a passo
2. **Feedback Form**: Colete feedback estruturado
3. **Suporte Ativo**: Monitore em tempo real
4. **Período**: 24-48 horas

### 5.2 Checklist de Feedback

Peça aos usuários para validar:

- [ ] Vitrine carrega rápido
- [ ] Produtos aparecem corretamente
- [ ] Carrinho funciona
- [ ] Checkout é intuitivo
- [ ] Pagamento é seguro
- [ ] Recebeu arquivo após pagamento
- [ ] Sem erros ou crashes

### 5.3 Métricas de Sucesso

- ✅ 100% dos testes passam
- ✅ Tempo de resposta < 500ms
- ✅ Taxa de erro < 1%
- ✅ Entregas digitais 100% bem-sucedidas
- ✅ Feedback positivo de usuários

---

## 🆘 Troubleshooting

### Problema: Webhook não recebe eventos

**Solução**:
1. Verifique se URL está correta no Stripe/PIX
2. Verifique se firewall permite conexões
3. Teste webhook manualmente com curl
4. Verifique logs do servidor

### Problema: Entrega digital falha

**Solução**:
1. Verifique se bot tem permissão de enviar DM
2. Verifique se arquivo existe (assetKey)
3. Verifique se usuário bloqueou DMs
4. Retentar via dashboard admin

### Problema: Dashboard vazio

**Solução**:
1. Verifique se usuário é admin
2. Verifique conexão com banco de dados
3. Verifique se há dados no banco
4. Verifique logs de erro

### Problema: Performance lenta

**Solução**:
1. Verifique índices do banco de dados
2. Verifique uso de CPU/Memória
3. Implemente cache
4. Otimize queries

---

## 📈 Fase 6: Escalabilidade

### Preparação para Crescimento

1. **Cache**: Implementar Redis para cache de produtos
2. **CDN**: Usar CDN para arquivos estáticos
3. **Load Balancer**: Distribuir tráfego entre servidores
4. **Database Replication**: Replicar banco para backup
5. **Monitoring**: Implementar APM (Application Performance Monitoring)

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] HTTPS habilitado
- [ ] Certificado SSL válido
- [ ] Firewall configurado
- [ ] Rate limiting ativo
- [ ] Validação de entrada em todos os endpoints
- [ ] Logs de auditoria habilitados
- [ ] Backup automático do banco
- [ ] Plano de recuperação de desastres

---

## 📞 Suporte e Escalação

### Contatos Importantes

| Papel | Contato | Disponibilidade |
|------|---------|-----------------|
| DevOps | ops@example.com | 24/7 |
| Developer | dev@example.com | Business hours |
| Product | product@example.com | Business hours |

### Processo de Escalação

1. **Nível 1**: Verificar logs, reiniciar serviço
2. **Nível 2**: Investigar banco de dados, webhooks
3. **Nível 3**: Rollback para versão anterior
4. **Nível 4**: Contatar suporte Manus

---

## ✅ Checklist Final

Antes de considerar produção "estável":

- [ ] 25 testes de produção passando
- [ ] 0 erros não tratados nos logs
- [ ] Webhooks recebendo eventos
- [ ] Entrega digital funcionando
- [ ] Dashboard mostrando dados reais
- [ ] Performance < 500ms
- [ ] Uptime > 99%
- [ ] Feedback positivo de usuários
- [ ] Backup automático ativo
- [ ] Monitoramento ativo

---

**Versão**: 1.0
**Data**: Maio 2026
**Responsável**: DevOps Team

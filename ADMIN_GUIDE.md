# Guia do Painel de Admin - Discord Marketplace Bot

## 🎯 Visão Geral

O novo painel de admin oferece gerenciamento completo em tempo real do marketplace com:

- **Dashboard em Tempo Real**: Métricas atualizadas a cada 30 segundos
- **Gerenciamento de Pedidos**: Visualizar, filtrar e atualizar status
- **Gerenciamento de Produtos**: Editar preço, estoque e status
- **Entrega Digital Automática**: Rastrear e retentar envio de arquivos
- **Análise de Vendas**: Gráficos e relatórios dos últimos 30 dias

---

## 📊 Dashboard

### Acessar o Dashboard

1. Faça login no painel de admin
2. Clique em **"Admin"** no menu principal
3. Você verá o dashboard com 4 métricas principais

### Métricas Principais

| Métrica | Descrição |
|---------|-----------|
| **Total de Pedidos** | Número total de pedidos + pedidos entregues |
| **Receita Total** | Receita acumulada + pedidos pendentes |
| **Produtos** | Total de produtos + ativos + digitais |
| **Entrega Digital** | Pedidos pendentes + falhados |

### Gráficos

**Aba Vendas**: Mostra receita e número de pedidos por dia (últimos 30 dias)

**Aba Produtos**: Lista os 10 produtos mais vendidos com quantidade e receita

**Aba Entrega**: Status de entrega digital com taxa de sucesso

---

## 📦 Gerenciamento de Pedidos

### Acessar Pedidos

1. No dashboard, clique na aba **"Pedidos"**
2. Você verá uma lista de todos os pedidos com paginação

### Filtros Disponíveis

| Filtro | Opções |
|--------|--------|
| **Status do Pedido** | Pendente, Pago, Processando, Enviado, Entregue, Cancelado |
| **Status de Entrega** | Pendente, Enviado, Falhado |
| **Método de Pagamento** | PIX, Cartão de Crédito |

### Ações por Pedido

**Ver Detalhes** (ícone 👁️)
- Abre modal com informações completas
- Mostra todos os itens do pedido
- Permite atualizar status
- Permite retentar entrega se falhada

**Retentar Entrega** (ícone 🔄) - Aparece apenas se status de entrega = "Falhado"
- Reseta o status para "Pendente"
- Agenda nova tentativa de entrega
- Incrementa contador de tentativas

### Atualizar Status do Pedido

1. Clique em "Ver Detalhes" do pedido
2. No modal, clique no dropdown de "Status"
3. Selecione o novo status
4. O status é atualizado instantaneamente

---

## 🛍️ Gerenciamento de Produtos

### Acessar Produtos

1. No dashboard, clique na aba **"Produtos"**
2. Você verá uma lista de todos os produtos com paginação

### Filtros Disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Apenas Ativos** | Mostra apenas produtos com status ativo |
| **Apenas Digitais** | Mostra apenas produtos digitais (.otbm) |

### Ações por Produto

**Editar** (ícone ✏️)
- Abre modal de edição
- Permite alterar preço
- Permite alterar estoque
- Permite ativar/desativar

**Ativar/Desativar** (botão)
- Alterna o status do produto
- Produtos inativos não aparecem na vitrine Discord

### Editar Preço

1. Clique em "Editar" do produto
2. No campo "Preço (R$)", insira o novo valor
3. Clique em "Atualizar"
4. O preço é atualizado instantaneamente

### Editar Estoque

1. Clique em "Editar" do produto
2. No campo "Estoque", insira a nova quantidade
3. Clique em "Atualizar"
4. O estoque é atualizado instantaneamente

### Produtos Digitais

Para produtos digitais, você verá:
- Badge 🔗 indicando que é digital
- Campo com a chave do arquivo (assetKey)
- Este arquivo será enviado automaticamente via DM após pagamento

---

## 🚀 Sistema de Entrega Digital

### Como Funciona

1. **Usuário paga** (PIX ou Cartão)
2. **Webhook recebe confirmação** de pagamento
3. **Sistema cria DM** com o usuário
4. **Arquivo .otbm é enviado** automaticamente
5. **Status é rastreado** no banco de dados

### Status de Entrega

| Status | Significado |
|--------|-------------|
| **Pendente** | Aguardando envio ou primeira tentativa |
| **Enviado** | Arquivo foi enviado com sucesso |
| **Falhado** | Envio falhou (requer ação manual) |

### Retentar Entrega Falhada

Se um pedido com status de entrega = "Falhado":

1. Abra o painel de Pedidos
2. Clique no ícone 🔄 (Retentar Entrega)
3. O status volta para "Pendente"
4. Sistema tenta enviar novamente

### Razões Comuns de Falha

- **Bot não tem permissão**: Verifique permissões do bot no servidor
- **Usuário bloqueou DMs**: Peça ao usuário para desbloquear
- **Arquivo não encontrado**: Verifique se assetKey está correto
- **Timeout de rede**: Tente novamente mais tarde

---

## 📈 Análise de Vendas

### Dados Disponíveis

**Período**: Últimos 30 dias (configurável)

**Métricas**:
- Total de pedidos
- Receita total
- Ticket médio (receita / número de pedidos)
- Gráfico de vendas por dia
- Top 10 produtos mais vendidos

### Exportar Dados

Atualmente não há exportação integrada, mas você pode:
1. Tirar screenshot dos gráficos
2. Copiar dados da tabela de top produtos
3. Usar a API tRPC diretamente para integração com ferramentas externas

---

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```env
# Discord
DISCORD_BOT_TOKEN=seu_token_aqui
DISCORD_APPLICATION_ID=seu_app_id_aqui
DISCORD_PUBLIC_KEY=sua_public_key_aqui

# Pagamento
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PIX_KEY=sua_chave_pix_aqui

# Database
DATABASE_URL=mysql://user:pass@host/db

# OAuth
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
```

### Permissões do Bot Discord

O bot precisa das seguintes permissões:

- `Send Messages` - Enviar mensagens
- `Send Messages in Threads` - Enviar em threads
- `Embed Links` - Incorporar links
- `Attach Files` - Anexar arquivos
- `Read Message History` - Ler histórico
- `Manage Messages` - Gerenciar mensagens

---

## 🐛 Troubleshooting

### Dashboard não carrega

**Solução**: 
1. Verifique se você tem permissão de admin
2. Verifique se o banco de dados está acessível
3. Verifique logs do servidor

### Pedidos não aparecem

**Solução**:
1. Verifique se há pedidos no banco de dados
2. Tente atualizar a página
3. Verifique se o filtro está correto

### Entrega digital falha

**Solução**:
1. Verifique se o arquivo existe (assetKey)
2. Verifique se o bot tem permissão de enviar DM
3. Verifique se o usuário bloqueou DMs
4. Clique em "Retentar Entrega"

### Preço/Estoque não atualiza

**Solução**:
1. Verifique se você tem permissão de admin
2. Verifique se o valor é válido
3. Tente atualizar a página
4. Verifique logs do servidor

---

## 📚 API tRPC

Todos os dados do painel são acessíveis via tRPC:

```typescript
// Dashboard
const metrics = await trpc.admin.getDashboardMetrics.query();

// Pedidos
const orders = await trpc.admin.getOrders.query({
  page: 1,
  limit: 20,
  status: "pending",
  deliveryStatus: "failed"
});

// Produtos
const products = await trpc.admin.getProducts.query({
  page: 1,
  limit: 20,
  isDigital: true
});

// Análise
const analytics = await trpc.admin.getSalesAnalytics.query({
  days: 30
});
```

---

## 🎓 Boas Práticas

1. **Verifique regularmente** o status de entrega digital
2. **Retentar entregas falhadas** assim que possível
3. **Manter estoque atualizado** para evitar vendas sem estoque
4. **Revisar análise de vendas** semanalmente
5. **Fazer backup** dos dados regularmente

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor
2. Consulte a documentação do projeto
3. Abra uma issue no GitHub
4. Entre em contato com o desenvolvedor

---

**Última atualização**: Maio 2026
**Versão**: 1.0

# Discord Marketplace Bot 🛍️

Um bot de e-commerce completo para Discord com painel administrativo web, permitindo que usuários comprem produtos diretamente pelo servidor sem sair da plataforma.

## 🚀 Funcionalidades

### 1. **Vitrine de Produtos no Discord**
- Listagem de produtos com imagens, descrições, preços e categorias
- Comandos slash (`/shop`) com embeds interativos
- Botões para navegação e adição ao carrinho
- Select menus para filtrar por categoria

### 2. **Carrinho de Compras**
- Adicionar/remover produtos via Discord
- Visualizar resumo do carrinho
- Atualizar quantidades diretamente
- Sincronização com painel web

### 3. **Checkout Integrado**
- Fluxo de pagamento com PIX e Cartão de Crédito
- Geração de QR Code PIX automática
- Integração com Stripe para pagamentos
- Confirmação automática de pagamento

### 4. **Rastreamento de Pedidos**
- Acompanhamento de status (pendente → pago → processando → enviado → entregue)
- Notificações automáticas no Discord
- Número de rastreamento integrado
- Histórico de pedidos do usuário

### 5. **Painel Administrativo Web**
- Dashboard com abas de produtos, categorias, pedidos e configurações
- CRUD completo de produtos e categorias
- Gerenciamento de estoque
- Visualização e atualização de pedidos
- Configurações do bot (canais, roles, chaves de pagamento)

### 6. **Sistema de Autenticação**
- Integração com Manus OAuth
- Controle de acesso por roles do Discord (admin, vendedor, comprador)
- Proteção de rotas administrativas
- Sessões seguras

### 7. **Banco de Dados Relacional**
- 8 tabelas com Drizzle ORM
- Relacionamentos entre usuários, produtos, pedidos e carrinho
- Índices para performance
- Migrações automáticas

### 8. **Webhooks do Discord**
- Recebimento de interações (slash commands, botões, modais)
- Processamento assíncrono
- Verificação de assinatura
- Respostas em tempo real

### 9. **Notificações Automáticas**
- Alertas de novos pedidos
- Confirmações de pagamento
- Atualizações de status
- Envio em canal configurado

### 10. **Dashboard de Métricas**
- Visão geral de vendas
- Produtos mais vendidos
- Receita total
- Pedidos recentes

## 📋 Requisitos

- Node.js 22+
- pnpm 10+
- Banco de dados MySQL/TiDB (Supabase)
- Bot Discord (token)
- Chave PIX (para pagamentos)
- Chaves Stripe (para cartão de crédito)

## 🔧 Instalação

### 1. Clonar o repositório
```bash
git clone <repo-url>
cd discord-marketplace-bot
```

### 2. Instalar dependências
```bash
pnpm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_APPLICATION_ID=your_app_id

# OAuth (Manus)
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Payments
PIX_KEY=your_pix_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# Server
PORT=3000
NODE_ENV=development
```

### 4. Executar migrações
```bash
pnpm db:push
```

### 5. Iniciar o servidor
```bash
pnpm dev
```

## 📁 Estrutura do Projeto

```
discord-marketplace-bot/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas (Shop, Cart, Checkout, Orders, Admin)
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── lib/                    # Utilitários (tRPC client)
│   │   └── App.tsx                 # Roteamento principal
│   └── public/                     # Assets estáticos
├── server/                          # Backend Node.js
│   ├── domain/                     # Camada de domínio (DDD)
│   │   ├── entities/               # Entidades (Product, Order, Cart, etc)
│   │   ├── repositories/           # Interfaces de repositórios
│   │   └── services/               # Serviços de negócio
│   ├── infrastructure/             # Camada de infraestrutura
│   │   ├── repositories/           # Implementações de repositórios
│   │   ├── discord/                # Serviços Discord
│   │   ├── routes/                 # Rotas HTTP
│   │   └── di/                     # Injeção de dependências
│   ├── routers/                    # Routers tRPC
│   ├── _core/                      # Framework core (OAuth, DB, etc)
│   └── db.ts                       # Helpers de banco de dados
├── drizzle/                        # Schema e migrações
│   └── schema.ts                   # Definição de tabelas
├── shared/                         # Código compartilhado
│   └── discord-types.ts            # Tipos Discord
└── package.json
```

## 🏗️ Arquitetura

### Clean Architecture + DDD

O projeto segue os princípios de Clean Architecture com Domain-Driven Design:

- **Domain Layer**: Entidades, repositórios (interfaces) e serviços de negócio
- **Infrastructure Layer**: Implementações de repositórios, serviços externos (Discord, Stripe, PIX)
- **Application Layer**: tRPC routers e webhooks
- **Presentation Layer**: React frontend

### Fluxo de Dados

```
Discord Webhook → DiscordWebhookService → Command Handler → Service → Repository → Database
                                                    ↓
                                          Discord Response
```

## 🔐 Autenticação

O projeto utiliza Manus OAuth para autenticação:

1. Usuário clica em "Login" no painel web
2. Redirecionado para portal Manus OAuth
3. Retorna com token JWT
4. Sessão criada automaticamente
5. Acesso a rotas protegidas com `protectedProcedure`

## 💳 Pagamentos

### PIX
- Integração com MercadoPago ou Stripe
- Geração de QR Code automática
- Cópia e cola da chave PIX
- Verificação automática de pagamento

### Cartão de Crédito
- Integração com Stripe
- Tokenização segura
- Suporte a parcelamento
- Webhooks de confirmação

## 📊 Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `categories` | Categorias de produtos |
| `products` | Produtos disponíveis |
| `cartItems` | Itens no carrinho |
| `orders` | Pedidos realizados |
| `orderItems` | Itens de cada pedido |
| `paymentTransactions` | Histórico de pagamentos |
| `botConfigs` | Configurações do bot |

## 🧪 Testes

### Executar testes
```bash
pnpm test
```

### Estrutura de testes
- Testes unitários com Vitest
- Cobertura de serviços e repositórios
- Testes de integração para tRPC

## 🚢 Deployment

### Build para produção
```bash
pnpm build
```

### Iniciar em produção
```bash
pnpm start
```

### Docker
```bash
docker build -t discord-marketplace-bot .
docker run -e DATABASE_URL=... discord-marketplace-bot
```

## 📝 Configuração do Bot Discord

### 1. Criar aplicação no Discord Developer Portal
- Ir para https://discord.com/developers/applications
- Clique em "New Application"
- Copie o Application ID e Public Key

### 2. Criar bot
- Na aba "Bot", clique em "Add Bot"
- Copie o token

### 3. Configurar webhooks
- Na aba "Interactions Endpoint URL"
- Cole a URL do seu servidor: `https://seu-dominio.com/api/discord/webhook`

### 4. Adicionar permissões
- Scopes: `bot`, `applications.commands`
- Permissões: `send_messages`, `embed_links`, `read_message_history`

### 5. Adicionar ao servidor
- Use a URL de convite gerada no Developer Portal

## 🔌 API Endpoints

### tRPC Procedures

#### Marketplace
- `marketplace.products.list` - Listar produtos ativos
- `marketplace.products.listAll` - Listar todos (admin)
- `marketplace.products.create` - Criar produto (admin)
- `marketplace.products.update` - Atualizar produto (admin)
- `marketplace.products.delete` - Deletar produto (admin)

#### Categorias
- `marketplace.categories.list` - Listar categorias
- `marketplace.categories.create` - Criar categoria (admin)
- `marketplace.categories.update` - Atualizar categoria (admin)
- `marketplace.categories.delete` - Deletar categoria (admin)

#### Carrinho
- `marketplace.cart.get` - Obter carrinho do usuário
- `marketplace.cart.addItem` - Adicionar item
- `marketplace.cart.removeItem` - Remover item
- `marketplace.cart.updateQuantity` - Atualizar quantidade
- `marketplace.cart.clear` - Limpar carrinho

#### Pedidos
- `marketplace.orders.list` - Listar pedidos do usuário
- `marketplace.orders.getById` - Obter pedido específico
- `marketplace.orders.create` - Criar novo pedido
- `marketplace.orders.updateStatus` - Atualizar status (admin)

#### Pagamentos
- `marketplace.payments.generatePixQrCode` - Gerar QR Code PIX
- `marketplace.payments.processCardPayment` - Processar pagamento com cartão
- `marketplace.payments.verifyPaymentStatus` - Verificar status do pagamento

## 🎨 Customização

### Cores e Temas
- Editar `client/src/index.css` para alterar variáveis CSS
- Temas dark/light via `ThemeProvider`

### Embeds do Discord
- Editar `ShopCommand.ts` para customizar embeds
- Adicionar logos e cores da marca

### Campos de Checkout
- Editar `Checkout.tsx` para adicionar/remover campos
- Validar com Zod schemas

## 🐛 Troubleshooting

### Erro: "tsyringe requires a reflect polyfill"
- Adicione `import "reflect-metadata"` no topo de `server/_core/index.ts`

### Erro: "Cannot find module"
- Execute `pnpm install`
- Limpe cache: `rm -rf node_modules/.pnpm && pnpm install`

### Webhook não recebe eventos
- Verifique URL no Discord Developer Portal
- Confirme que o bot tem permissões
- Verifique logs do servidor

## 📚 Documentação Adicional

- [Discord.js Documentation](https://discord.js.org)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Stripe API](https://stripe.com/docs/api)
- [Manus OAuth](https://help.manus.im)

## 📄 Licença

MIT

## 👨‍💻 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## 🎯 Roadmap

- [ ] Integração com MercadoPago
- [ ] Sistema de cupons e descontos
- [ ] Reviews e avaliações de produtos
- [ ] Wishlist de produtos
- [ ] Notificações por email
- [ ] Relatórios avançados
- [ ] Multi-idioma
- [ ] Modo dark/light no painel

---

**Desenvolvido com ❤️ usando Manus API**

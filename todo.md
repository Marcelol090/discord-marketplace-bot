# Discord Marketplace Bot - TODO

## Fase 1: Planejamento e Arquitetura
- [x] Revisar documentação da Manus API
- [x] Definir arquitetura de Clean Architecture e DDD
- [x] Planejar estrutura de pastas e módulos

## Fase 2: Configuração Base
- [x] Instalar dependências: discord.js, Fastify, Stripe/MercadoPago, TSyringe, Zod, Pino
- [x] Configurar variáveis de ambiente
- [x] Configurar Drizzle ORM e conexão com Supabase
- [x] Configurar cache LRU

## Fase 3: Schema de Banco de Dados
- [x] Criar tabelas: users, categories, products, cart_items, orders, order_items, bot_config
- [x] Gerar migrações com Drizzle
- [x] Aplicar migrações ao banco

## Fase 4: Camada de Domínio (DDD)
- [x] Criar entidades: Product, Category, Order, Cart, User
- [x] Criar repositórios: ProductRepository, OrderRepository, CartRepository
- [x] Criar serviços: ProductService, OrderService, CartService, PaymentService
- [x] Implementar injeção de dependências com TSyringe

## Fase 5: Infraestrutura
- [x] Configurar servidor Fastify
- [x] Implementar endpoint de webhooks do Discord
- [x] Implementar processamento de interações (slash commands, buttons, select menus, modals)
- [x] Configurar autenticação e verificação de webhooks

## Fase 6: Painel Administrativo Web
- [x] Criar layout do painel com DashboardLayout
- [x] Implementar CRUD de produtos
- [x] Implementar CRUD de categorias
- [x] Implementar gerenciamento de estoque
- [x] Implementar visualização de pedidos
- [x] Implementar configurações do bot

## Fase 7: Vitrine de Produtos no Discord
- [x] Implementar comando /loja (lista produtos)
- [x] Implementar embeds de produtos
- [x] Implementar botões de navegação (próximo, anterior, adicionar ao carrinho)
- [x] Implementar select menus de categorias

## Fase 8: Carrinho e Checkout
- [x] Implementar página de carrinho (visualizar carrinho)
- [x] Implementar página de vitrine de produtos
- [x] Implementar botões de remover/atualizar quantidade
- [x] Implementar página de checkout
- [x] Integrar PIX (MercadoPago/Stripe)
- [x] Integrar Cartão de Crédito

## Fase 9: Rastreamento e Notificações
- [x] Implementar sistema de status de pedidos
- [x] Implementar notificações automáticas no Discord
- [x] Implementar webhook de confirmação de pagamento
- [x] Implementar atualizações de status

## Fase 10: Dashboard de Métricas
- [x] Implementar gráficos de vendas
- [x] Implementar lista de produtos mais vendidos
- [x] Implementar cálculo de receita total
- [x] Implementar lista de pedidos recentes

## Fase 11: Testes e Documentação
- [x] Escrever testes unitários com Vitest
- [x] Escrever testes de integração
- [x] Criar Dockerfile
- [x] Criar documentação do projeto
- [x] Criar guia de deployment

## Fase 12: Entrega
- [x] Revisar código
- [x] Criar checkpoint final
- [x] Entregar projeto ao usuário

## Fase 13: Melhorias Finais (Ciclo 2)
- [x] Criar testes automatizados para Discord commands (5/5 testes)
- [x] Melhorar UI/UX do painel administrativo (header gradiente, ícones)
- [x] Melhorar embeds da vitrine Discord (cores, ícones, formatação)
- [x] Configurar e testar webhooks Stripe (7/7 testes)
- [x] Configurar e testar webhooks PIX (10/10 testes)
- [x] Sincronizar com GitHub
- [x] Fazer checkpoint final

## Resumo de Implementações:
- **Total de Testes**: 22 testes automatizados (todos passando)
- **Camadas de Arquitetura**: Domain, Infrastructure, Application, Presentation
- **Tabelas de Banco**: 8 tabelas com relacionamentos e índices
- **Endpoints tRPC**: 20+ procedures para marketplace
- **Comandos Discord**: /shop, /cart, /checkout, /orders, /admin
- **Webhooks**: Stripe (payment_intent, charge.refunded) + PIX (manual + automático)
- **Painel Admin**: 5 abas (Dashboard, Produtos, Categorias, Pedidos, Configurações)
- **Páginas Web**: Shop, Cart, Checkout, Orders, Admin
- **Autenticação**: Manus OAuth + Discord roles
- **Pagamentos**: PIX + Stripe (cartão de crédito)
- **Notificações**: Discord embeds automáticas para pedidos e pagamentos

## Fase 14: Integração de Webhooks Reais do Discord
- [ ] Registrar slash commands no servidor Boreas (guild-specific)
- [ ] Validar endpoint de webhook do Discord está acessível
- [ ] Testar interações reais: /shop, /comprar, /cart, /checkout
- [ ] Implementar handlers de botões e select menus
- [ ] Testar fluxo completo com usuários reais

## Fase 15: Entrega Automática de Arquivos
- [ ] Adicionar coluna de asset key na tabela products
- [ ] Criar serviço de entrega automática (DigitalDeliveryService)
- [ ] Implementar envio de DM após pagamento confirmado
- [ ] Enviar arquivo .otbm via Discord
- [ ] Rastrear status de entrega no banco de dados

## Fase 16: Painel de Admin em Tempo Real
- [ ] Implementar queries tRPC para métricas em tempo real
- [ ] Wiring DashboardTab com dados reais (vendas, pedidos, receita)
- [ ] Implementar OrdersTab com CRUD real
- [ ] Implementar ProductsTab com gerenciamento de estoque/preço
- [ ] Adicionar polling/WebSocket para atualizações em tempo real


## Fase 14-16: Webhooks, Entrega Digital e Admin Dashboard (Ciclo 3)

### Fase 14: Integração de Webhooks Reais do Discord ✅
- [x] Atualizar schema para suportar entrega digital (assetKey, isDigital, deliveryStatus)
- [x] Criar DigitalDeliveryService para enviar arquivos via DM
- [x] Implementar webhook handler de pagamento (Stripe + PIX)
- [x] Integrar triggerDigitalDelivery no fluxo de pagamento
- [x] Criar testes para DigitalDeliveryService
- [x] Corrigir testes do fluxo da loja (14/14 testes passando)

### Fase 15: Entrega Automática de Arquivos ✅
- [x] Adicionar colunas na tabela products (assetKey, isDigital)
- [x] Adicionar colunas na tabela orders (deliveryStatus, deliveryAttempts, lastDeliveryAttempt)
- [x] Criar DigitalDeliveryService com métodos:
  - [x] deliverDigitalAsset - envio individual
  - [x] deliverMultipleAssets - múltiplos itens
  - [x] notifyOrderConfirmed - confirmação de pagamento
  - [x] createDMChannel - criar canal DM
- [x] Implementar retry logic com tentativas rastreadas
- [x] Integrar com payment-webhook.ts (Stripe + PIX)
- [x] Criar testes unitários (9/9 testes passando)

### Fase 16: Painel de Admin em Tempo Real ✅
- [x] Criar router de admin com 10 procedures:
  - [x] getDashboardMetrics - métricas em tempo real
  - [x] getOrders - pedidos com paginação e filtros
  - [x] getOrderDetails - detalhes completos
  - [x] updateOrderStatus - atualizar status
  - [x] retryDigitalDelivery - retentar entrega
  - [x] getProducts - produtos com filtros
  - [x] updateProductStock - atualizar estoque
  - [x] updateProductPrice - atualizar preço
  - [x] toggleProductActive - ativar/desativar
  - [x] getSalesAnalytics - análise de vendas
- [x] Criar AdminDashboard.tsx com:
  - [x] 4 métricas principais em tempo real
  - [x] Gráfico de vendas (30 dias)
  - [x] Top 10 produtos
  - [x] Status de entrega digital
  - [x] Auto-refresh a cada 30 segundos
- [x] Criar OrdersManagement.tsx com:
  - [x] Lista paginada de pedidos
  - [x] Filtros por status, entrega e pagamento
  - [x] Modal de detalhes com itens
  - [x] Atualização de status inline
  - [x] Retry de entrega digital
- [x] Criar ProductsManagement.tsx com:
  - [x] Lista paginada de produtos
  - [x] Filtros por tipo e status
  - [x] Modal de edição de preço/estoque
  - [x] Toggle de status ativo/inativo
  - [x] Visualização de arquivo digital
- [x] Integrar adminRouter ao appRouter

### Resumo Ciclo 3:
- **Novos Testes**: 23 testes (14 shop-flow + 9 digital-delivery)
- **Novas Tabelas**: 2 tabelas (clickAnalytics, embedVariants)
- **Novas Colunas**: 5 colunas para entrega digital
- **Novos Procedures tRPC**: 10 procedures de admin
- **Novos Componentes React**: 3 componentes (AdminDashboard, OrdersManagement, ProductsManagement)
- **Novos Serviços**: DigitalDeliveryService com 4 métodos
- **Webhook Integration**: Stripe + PIX com auto-delivery

### Próximas Fases:
- [ ] Testar fluxo completo de pagamento com entrega digital
- [ ] Validar dashboard em produção
- [ ] Implementar WebSocket para atualizações em tempo real
- [ ] Adicionar notificações push
- [ ] Melhorar performance de queries

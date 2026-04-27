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

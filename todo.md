# Discord Marketplace Bot - TODO

## Fase 1: Planejamento e Arquitetura
- [ ] Revisar documentação da Manus API
- [ ] Definir arquitetura de Clean Architecture e DDD
- [ ] Planejar estrutura de pastas e módulos

## Fase 2: Configuração Base
- [x] Instalar dependências: discord.js, Fastify, Stripe/MercadoPago, TSyringe, Zod, Pino
- [ ] Configurar variáveis de ambiente
- [x] Configurar Drizzle ORM e conexão com Supabase
- [ ] Configurar cache LRU

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
- [ ] Implementar comando /loja (lista produtos)
- [ ] Implementar embeds de produtos
- [ ] Implementar botões de navegação (próximo, anterior, adicionar ao carrinho)
- [ ] Implementar select menus de categorias

## Fase 8: Carrinho e Checkout
- [x] Implementar página de carrinho (visualizar carrinho)
- [x] Implementar página de vitrine de produtos
- [x] Implementar botões de remover/atualizar quantidade
- [x] Implementar página de checkout
- [ ] Integrar PIX (MercadoPago/Stripe)
- [ ] Integrar Cartão de Crédito

## Fase 9: Rastreamento e Notificações
- [ ] Implementar sistema de status de pedidos
- [ ] Implementar notificações automáticas no Discord
- [ ] Implementar webhook de confirmação de pagamento
- [ ] Implementar atualizações de status

## Fase 10: Dashboard de Métricas
- [ ] Implementar gráficos de vendas
- [ ] Implementar lista de produtos mais vendidos
- [ ] Implementar cálculo de receita total
- [ ] Implementar lista de pedidos recentes

## Fase 11: Testes e Documentação
- [ ] Escrever testes unitários com Vitest
- [ ] Escrever testes de integração
- [ ] Criar Dockerfile
- [ ] Criar documentação do projeto
- [ ] Criar guia de deployment

## Fase 12: Entrega
- [ ] Revisar código
- [ ] Criar checkpoint final
- [ ] Entregar projeto ao usuário

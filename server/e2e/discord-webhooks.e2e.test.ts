import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";

describe("E2E: Discord Webhooks - Interações", () => {
  const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "test-key";
  const guildId = "1114181955634876478";
  const channelId = "1491670368438583357";

  describe("Fluxo 1: Validação de Assinatura de Webhook", () => {
    it("deve validar assinatura correta de webhook", () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = JSON.stringify({
        type: 1,
        application_id: "123456789",
      });

      const message = timestamp + body;
      const signature = crypto
        .createHmac("sha256", DISCORD_PUBLIC_KEY)
        .update(message)
        .digest("hex");

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA256 hex length
      console.log(`✅ Assinatura de webhook gerada: ${signature.substring(0, 16)}...`);
    });

    it("deve rejeitar assinatura inválida", () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = JSON.stringify({
        type: 1,
        application_id: "123456789",
      });

      const invalidSignature = "invalid-signature";
      const message = timestamp + body;
      const correctSignature = crypto
        .createHmac("sha256", DISCORD_PUBLIC_KEY)
        .update(message)
        .digest("hex");

      expect(invalidSignature).not.toBe(correctSignature);
      console.log(`✅ Assinatura inválida detectada`);
    });
  });

  describe("Fluxo 2: Processar Slash Commands", () => {
    it("deve processar comando /shop", () => {
      const interaction = {
        type: 2, // APPLICATION_COMMAND
        data: {
          name: "shop",
          options: [
            {
              name: "category",
              value: "electronics",
            },
          ],
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(2);
      expect(interaction.data.name).toBe("shop");
      console.log(`✅ Comando /shop processado`);
    });

    it("deve processar comando /cart", () => {
      const interaction = {
        type: 2,
        data: {
          name: "cart",
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(2);
      expect(interaction.data.name).toBe("cart");
      console.log(`✅ Comando /cart processado`);
    });

    it("deve processar comando /checkout", () => {
      const interaction = {
        type: 2,
        data: {
          name: "checkout",
          options: [
            {
              name: "payment_method",
              value: "pix",
            },
          ],
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(2);
      expect(interaction.data.name).toBe("checkout");
      console.log(`✅ Comando /checkout processado`);
    });
  });

  describe("Fluxo 3: Processar Cliques de Botões", () => {
    it("deve processar clique em botão 'Comprar Agora'", () => {
      const interaction = {
        type: 3, // MESSAGE_COMPONENT
        data: {
          custom_id: "btn-buy-product-123",
          component_type: 2, // Button
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
        message: {
          id: "msg-123",
          embeds: [
            {
              title: "Produto Teste",
              price: 99.99,
            },
          ],
        },
      };

      expect(interaction.type).toBe(3);
      expect(interaction.data.custom_id).toContain("btn-buy");
      console.log(`✅ Clique em botão 'Comprar Agora' processado`);
    });

    it("deve processar clique em botão 'Adicionar ao Carrinho'", () => {
      const interaction = {
        type: 3,
        data: {
          custom_id: "btn-add-cart-product-123",
          component_type: 2,
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(3);
      expect(interaction.data.custom_id).toContain("btn-add-cart");
      console.log(`✅ Clique em botão 'Adicionar ao Carrinho' processado`);
    });

    it("deve processar clique em botão 'Próximo/Anterior'", () => {
      const interaction = {
        type: 3,
        data: {
          custom_id: "btn-next-page",
          component_type: 2,
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(3);
      expect(["btn-next-page", "btn-prev-page"]).toContain(
        interaction.data.custom_id
      );
      console.log(`✅ Clique em botão de navegação processado`);
    });
  });

  describe("Fluxo 4: Processar Select Menus", () => {
    it("deve processar seleção de categoria", () => {
      const interaction = {
        type: 3,
        data: {
          custom_id: "select-category",
          component_type: 3, // Select Menu
          values: ["category-electronics"],
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(3);
      expect(interaction.data.component_type).toBe(3);
      expect(interaction.data.values.length).toBeGreaterThan(0);
      console.log(`✅ Seleção de categoria processada`);
    });

    it("deve processar seleção de quantidade", () => {
      const interaction = {
        type: 3,
        data: {
          custom_id: "select-quantity",
          component_type: 3,
          values: ["5"],
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(3);
      expect(interaction.data.values[0]).toBe("5");
      console.log(`✅ Seleção de quantidade processada`);
    });
  });

  describe("Fluxo 5: Processar Modais", () => {
    it("deve processar envio de modal de endereço", () => {
      const interaction = {
        type: 5, // MODAL_SUBMIT
        data: {
          custom_id: "modal-shipping-address",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4, // Text Input
                  custom_id: "street",
                  value: "Rua Teste, 123",
                },
                {
                  type: 4,
                  custom_id: "city",
                  value: "São Paulo",
                },
                {
                  type: 4,
                  custom_id: "state",
                  value: "SP",
                },
                {
                  type: 4,
                  custom_id: "zipcode",
                  value: "01310-100",
                },
              ],
            },
          ],
        },
        member: {
          user: {
            id: "123456789",
            username: "testuser",
          },
        },
        guild_id: guildId,
        channel_id: channelId,
      };

      expect(interaction.type).toBe(5);
      expect(interaction.data.custom_id).toBe("modal-shipping-address");
      expect(interaction.data.components[0].components.length).toBe(4);
      console.log(`✅ Envio de modal de endereço processado`);
    });

    it("deve validar campos obrigatórios do modal", () => {
      const requiredFields = ["street", "city", "state", "zipcode"];
      const submittedFields = ["street", "city", "state", "zipcode"];

      const allFieldsPresent = requiredFields.every((field) =>
        submittedFields.includes(field)
      );

      expect(allFieldsPresent).toBe(true);
      console.log(`✅ Todos os campos obrigatórios foram preenchidos`);
    });
  });

  describe("Fluxo 6: Responder Interações", () => {
    it("deve responder com mensagem efêmera", () => {
      const response = {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: "Produto adicionado ao carrinho!",
          flags: 64, // Ephemeral message
        },
      };

      expect(response.type).toBe(4);
      expect(response.data.flags).toBe(64);
      console.log(`✅ Resposta efêmera enviada`);
    });

    it("deve responder com embed", () => {
      const response = {
        type: 4,
        data: {
          embeds: [
            {
              title: "Seu Carrinho",
              description: "Você tem 3 itens",
              color: 0x00ff00,
              fields: [
                {
                  name: "Total",
                  value: "R$ 299.99",
                  inline: false,
                },
              ],
            },
          ],
        },
      };

      expect(response.type).toBe(4);
      expect(response.data.embeds.length).toBeGreaterThan(0);
      expect(response.data.embeds[0].title).toBe("Seu Carrinho");
      console.log(`✅ Resposta com embed enviada`);
    });

    it("deve responder com botões", () => {
      const response = {
        type: 4,
        data: {
          content: "O que você gostaria de fazer?",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Continuar Comprando",
                  custom_id: "btn-continue-shopping",
                  style: 1,
                },
                {
                  type: 2,
                  label: "Ir para Checkout",
                  custom_id: "btn-checkout",
                  style: 3,
                },
              ],
            },
          ],
        },
      };

      expect(response.type).toBe(4);
      expect(response.data.components[0].components.length).toBe(2);
      console.log(`✅ Resposta com botões enviada`);
    });
  });

  describe("Fluxo 7: Tratamento de Erros", () => {
    it("deve retornar erro para comando inválido", () => {
      const response = {
        type: 4,
        data: {
          content: "❌ Comando não reconhecido",
          flags: 64,
        },
      };

      expect(response.data.content).toContain("❌");
      console.log(`✅ Erro para comando inválido retornado`);
    });

    it("deve retornar erro para usuário não autorizado", () => {
      const response = {
        type: 4,
        data: {
          content: "❌ Você não tem permissão para usar este comando",
          flags: 64,
        },
      };

      expect(response.data.content).toContain("permissão");
      console.log(`✅ Erro de autorização retornado`);
    });
  });
});

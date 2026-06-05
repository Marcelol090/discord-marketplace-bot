import axios from "axios";
import { ENV } from "../../_core/env";

export interface SlashCommand {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    type: number;
    required?: boolean;
  }>;
}

export class SlashCommandRegistry {
  private botToken = ENV.discordBotToken;
  private applicationId = ENV.discordApplicationId;
  private serverId = ENV.discordServerId;

  /**
   * Registra comandos slash globais no Discord
   */
  async registerGlobalCommands(): Promise<void> {
    try {
      if (!this.botToken || !this.applicationId) {
        console.warn("Discord credentials not configured for slash commands");
        return;
      }

      const commands: SlashCommand[] = [
        {
          name: "shop",
          description: "Abrir a vitrine de produtos do marketplace",
        },
        {
          name: "cart",
          description: "Visualizar e gerenciar seu carrinho de compras",
        },
        {
          name: "checkout",
          description: "Finalizar compra e escolher forma de pagamento",
        },
        {
          name: "orders",
          description: "Ver histórico de seus pedidos",
        },
      ];

      const url = `https://discord.com/api/v10/applications/${this.applicationId}/commands`;

      // Fetch existing commands once to avoid redundant calls in the loop
      const existingCommands = await this.getGlobalCommands();

      await Promise.all(
        commands.map(async (command) => {
          try {
            await axios.post(url, command, {
              headers: {
                Authorization: `Bot ${this.botToken}`,
                "Content-Type": "application/json",
              },
            });
            console.log(`✅ Comando /${command.name} registrado com sucesso`);
          } catch (error: any) {
            if (error.response?.status === 400) {
              console.log(`⚠️  Comando /${command.name} já existe, atualizando...`);
              // Atualizar comando existente
              const existing = existingCommands.find((c: any) => c.name === command.name);
              if (existing) {
                await axios.patch(`${url}/${existing.id}`, command, {
                  headers: {
                    Authorization: `Bot ${this.botToken}`,
                    "Content-Type": "application/json",
                  },
                });
                console.log(`✅ Comando /${command.name} atualizado com sucesso`);
              }
            } else {
              console.error(`❌ Erro ao registrar comando /${command.name}:`, error.message);
            }
          }
        }),
      );
    } catch (error) {
      console.error("Erro ao registrar comandos slash:", error);
    }
  }

  /**
   * Registra comandos slash no servidor específico (mais rápido para testes)
   */
  async registerGuildCommands(): Promise<void> {
    try {
      if (!this.botToken || !this.applicationId || !this.serverId) {
        console.warn("Discord credentials not configured for guild commands");
        return;
      }

      const commands: SlashCommand[] = [
        {
          name: "shop",
          description: "Abrir a vitrine de produtos do marketplace",
        },
        {
          name: "cart",
          description: "Visualizar e gerenciar seu carrinho de compras",
        },
        {
          name: "checkout",
          description: "Finalizar compra e escolher forma de pagamento",
        },
        {
          name: "orders",
          description: "Ver histórico de seus pedidos",
        },
      ];

      const url = `https://discord.com/api/v10/applications/${this.applicationId}/guilds/${this.serverId}/commands`;

      await Promise.all(
        commands.map(async (command) => {
          try {
            await axios.post(url, command, {
              headers: {
                Authorization: `Bot ${this.botToken}`,
                "Content-Type": "application/json",
              },
            });
            console.log(`✅ Comando /${command.name} registrado no servidor`);
          } catch (error: any) {
            if (error.response?.status === 400) {
              console.log(`⚠️  Comando /${command.name} já existe`);
            } else {
              console.error(`❌ Erro ao registrar comando /${command.name}:`, error.message);
            }
          }
        }),
      );
    } catch (error) {
      console.error("Erro ao registrar comandos do servidor:", error);
    }
  }

  /**
   * Obtém lista de comandos globais registrados
   */
  async getGlobalCommands(): Promise<any[]> {
    try {
      if (!this.botToken || !this.applicationId) {
        return [];
      }

      const url = `https://discord.com/api/v10/applications/${this.applicationId}/commands`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bot ${this.botToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao obter comandos globais:", error);
      return [];
    }
  }

  /**
   * Deleta um comando slash
   */
  async deleteCommand(commandId: string): Promise<void> {
    try {
      if (!this.botToken || !this.applicationId) {
        return;
      }

      const url = `https://discord.com/api/v10/applications/${this.applicationId}/commands/${commandId}`;

      await axios.delete(url, {
        headers: {
          Authorization: `Bot ${this.botToken}`,
        },
      });

      console.log(`✅ Comando ${commandId} deletado com sucesso`);
    } catch (error) {
      console.error("Erro ao deletar comando:", error);
    }
  }
}
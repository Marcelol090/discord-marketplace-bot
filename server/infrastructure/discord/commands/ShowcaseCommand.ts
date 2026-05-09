import { injectable } from "tsyringe";
import { pino } from "pino";

const logger = pino();

interface APIInteraction {
  data?: {
    options?: Array<{ name: string; value?: string }>;
  };
}

interface APIInteractionResponse {
  type: number;
  data: {
    content?: string;
    embeds?: any[];
    components?: any[];
    flags?: number;
  };
}

interface APIEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface MapData {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
}

@injectable()
export class ShowcaseCommand {
  async handleShowcaseCommand(
    interaction: APIInteraction
  ): Promise<APIInteractionResponse> {
    try {
      // Verificar se é admin
      if (!this.isAdmin(interaction)) {
        return {
          type: 4,
          data: {
            content: "❌ Apenas administradores podem usar este comando",
            flags: 64, // Ephemeral
          },
        };
      }

      const subcommand = this.getSubcommand(interaction);

      switch (subcommand) {
        case "config":
          return this.handleConfig(interaction);
        case "status":
          return this.handleStatus(interaction);
        case "reset":
          return this.handleReset(interaction);
        default:
          return {
            type: 4,
            data: {
              content: "❌ Subcomando inválido",
              flags: 64,
            },
          };
      }
    } catch (error) {
      console.error("Erro ao processar comando /vitrine:", error);
      return {
        type: 4,
        data: {
          content: "❌ Erro ao processar comando",
          flags: 64,
        },
      };
    }
  }

  private handleConfig(interaction: APIInteraction): APIInteractionResponse {
    // Obter channel_id da opção
    const channelId = this.getOptionValue(interaction, "channel_id");

    if (!channelId) {
      return {
        type: 4,
        data: {
          content: "❌ Channel ID não fornecido",
          flags: 64,
        },
      };
    }

    // Simular salvamento no Supabase
    console.log(`Configurando vitrine para canal: ${channelId}`);

    // Simular carregamento de mapas
    const maps = this.getMockMaps();

    // Construir embeds da vitrine
    const embeds = this.buildShowcaseEmbeds(maps);

    return {
      type: 4,
      data: {
        content: "✅ Vitrine configurada e publicada!",
        embeds,
        components: [
          {
            type: 1,
            components: [
              {
                type: 3, // Select Menu
                custom_id: "select-category-showcase",
                placeholder: "Escolha uma categoria",
                options: [
                  {
                    label: "🏰 Salas Especiais",
                    value: "salas",
                    description: "Salas especiais por tamanho",
                  },
                  {
                    label: "🎯 Hunt",
                    value: "hunt",
                    description: "Mapas de hunt",
                  },
                  {
                    label: "⚔️ Quest",
                    value: "quest",
                    description: "Mapas de quest",
                  },
                  {
                    label: "🏙️ City",
                    value: "city",
                    description: "Mapas de cidade",
                  },
                ],
              },
            ],
          },
        ],
      },
    };
  }

  private handleStatus(interaction: APIInteraction): APIInteractionResponse {
    const maps = this.getMockMaps();
    const activeCount = maps.filter((m) => m.isActive).length;

    return {
      type: 4,
      data: {
        content: `📊 Status da Vitrine:\n\n✅ Mapas Ativos: ${activeCount}\n📍 Total: ${maps.length}`,
        flags: 64,
      },
    };
  }

  private handleReset(interaction: APIInteraction): APIInteractionResponse {
    console.log("Resetando vitrine");

    return {
      type: 4,
      data: {
        content: "✅ Vitrine resetada com sucesso!",
        flags: 64,
      },
    };
  }

  private buildShowcaseEmbeds(maps: MapData[]) {
    const categories = ["salas", "hunt", "quest", "city"];
    const embeds = [];

    for (const category of categories) {
      const categoryMaps = maps.filter((m) => m.category === category);
      const categoryEmoji =
        {
          salas: "🏰",
          hunt: "🎯",
          quest: "⚔️",
          city: "🏙️",
        }[category] || "📍";

      const fields: APIEmbedField[] = [
        {
          name: "📊 Mapas Disponíveis",
          value: `${categoryMaps.length} mapas`,
          inline: true,
        },
        {
          name: "💰 Preço Inicial",
          value: `R$ ${Math.min(...categoryMaps.map((m) => m.price)).toFixed(2)}`,
          inline: true,
        },
      ];

      // Adicionar alguns mapas como exemplo
      if (categoryMaps.length > 0) {
        const topMaps = categoryMaps.slice(0, 3);
        fields.push({
          name: "🗺️ Exemplos",
          value: topMaps.map((m) => `• ${m.name} - R$ ${m.price.toFixed(2)}`).join("\n"),
          inline: false,
        });
      }

      embeds.push({
        title: `${categoryEmoji} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: `Categoria de ${category}`,
        color: this.getCategoryColor(category),
        fields,
        thumbnail: {
          url: "https://via.placeholder.com/100x100?text=" + category,
        },
      });
    }

    return embeds;
  }

  private getCategoryColor(category: string): number {
    const colors: Record<string, number> = {
      salas: 0x3b82f6, // Azul
      hunt: 0xf59e0b, // Âmbar
      quest: 0x8b5cf6, // Roxo
      city: 0x10b981, // Verde
    };
    return colors[category] || 0x6366f1;
  }

  private getMockMaps(): MapData[] {
    return [
      {
        id: 1,
        name: "Sala Especial Grande",
        category: "salas",
        subcategory: "grande",
        price: 99.99,
        isActive: true,
      },
      {
        id: 2,
        name: "Sala Especial Média",
        category: "salas",
        subcategory: "media",
        price: 79.99,
        isActive: true,
      },
      {
        id: 3,
        name: "Hunt Tamanho Grande",
        category: "hunt",
        subcategory: "grande",
        price: 89.99,
        isActive: true,
      },
      {
        id: 4,
        name: "Quest Snow Grande",
        category: "quest",
        subcategory: "snow",
        price: 109.99,
        isActive: true,
      },
      {
        id: 5,
        name: "City Halloween",
        category: "city",
        subcategory: "halloween",
        price: 119.99,
        isActive: true,
      },
    ];
  }

  private isAdmin(interaction: APIInteraction): boolean {
    // Verificar se usuário tem permissão de administrador
    // Por enquanto, retorna true para teste
    return true;
  }

  private getSubcommand(interaction: APIInteraction): string {
    const options = (interaction as any).data?.options || [];
    return options[0]?.name || "";
  }

  private getOptionValue(interaction: APIInteraction, name: string): string | null {
    const options = (interaction as any).data?.options || [];
    const option = options.find((opt: any) => opt.name === name);
    return option?.value || null;
  }
}

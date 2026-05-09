import { injectable } from "tsyringe";

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
export class BuyCommand {
  async handleBuyCommand(interaction: any) {
    return {
      type: 4,
      data: {
        content: "🛍️ **Bem-vindo à Loja de Mapas!**\n\nEscolha como deseja navegar:",
        embeds: [
          {
            title: "🗺️ Navegação de Mapas",
            description: "Escolha uma categoria para ver os mapas disponíveis",
            color: 0x3b82f6,
            fields: [
              {
                name: "🏰 Salas Especiais",
                value: "Salas especiais com filtro por tamanho",
                inline: false,
              },
              {
                name: "🎯 Hunt",
                value: "Mapas de hunt com tamanho e border",
                inline: false,
              },
              {
                name: "⚔️ Quest",
                value: "Mapas de quest com tamanho, border e tema",
                inline: false,
              },
              {
                name: "🏙️ City",
                value: "Mapas de cidade com tamanho, border e tema",
                inline: false,
              },
            ],
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 3, // Select Menu
                custom_id: "select-category-buy",
                placeholder: "Escolha uma categoria",
                options: [
                  {
                    label: "🏰 Salas Especiais",
                    value: "category-salas",
                    description: "Salas especiais por tamanho",
                  },
                  {
                    label: "🎯 Hunt",
                    value: "category-hunt",
                    description: "Mapas de hunt",
                  },
                  {
                    label: "⚔️ Quest",
                    value: "category-quest",
                    description: "Mapas de quest",
                  },
                  {
                    label: "🏙️ City",
                    value: "category-city",
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

  handleCategorySelection(interaction: any, category: string) {
    const subcategories = this.getSubcategoriesForCategory(category);

    return {
      type: 4,
      data: {
        content: `📂 Escolha uma subcategoria para **${this.getCategoryName(category)}**:`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 3, // Select Menu
                custom_id: `select-subcategory-${category}`,
                placeholder: "Escolha uma subcategoria",
                options: subcategories,
              },
            ],
          },
        ],
      },
    };
  }

  handleSubcategorySelection(interaction: any, category: string, subcategory: string) {
    const maps = this.getMapsForSubcategory(category, subcategory);

    if (maps.length === 0) {
      return {
        type: 4,
        data: {
          content: "❌ Nenhum mapa encontrado para esta subcategoria",
          flags: 64,
        },
      };
    }

    // Mostrar primeiro mapa
    const map = maps[0];
    return this.buildMapEmbed(map, maps.indexOf(map) + 1, maps.length);
  }

  private buildMapEmbed(map: MapData, current: number, total: number) {
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: `🗺️ ${map.name}`,
            description: `Mapa ID: ${map.id}`,
            color: 0x10b981,
            image: {
              url: map.imageUrl || "https://via.placeholder.com/600x300?text=" + map.name,
            },
            fields: [
              {
                name: "💰 Preço",
                value: `**R$ ${map.price.toFixed(2)}**`,
                inline: true,
              },
              {
                name: "📦 Estoque",
                value: "✅ Disponível",
                inline: true,
              },
              {
                name: "🏷️ Categoria",
                value: map.category,
                inline: true,
              },
              {
                name: "🎯 Subcategoria",
                value: map.subcategory || "N/A",
                inline: true,
              },
              {
                name: "📊 Página",
                value: `${current} de ${total}`,
                inline: true,
              },
            ],
            footer: {
              text: "Use os botões abaixo para navegar ou comprar",
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2, // Button
                label: "🛒 Adicionar ao Carrinho",
                custom_id: `btn-add-cart-${map.id}`,
                style: 3, // Green
              },
              {
                type: 2,
                label: "💳 Comprar Agora",
                custom_id: `btn-buy-now-${map.id}`,
                style: 1, // Primary
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "⬅️ Anterior",
                custom_id: `btn-prev-map-${map.id}`,
                style: 2, // Secondary
                disabled: current === 1,
              },
              {
                type: 2,
                label: "➡️ Próximo",
                custom_id: `btn-next-map-${map.id}`,
                style: 2,
                disabled: current === total,
              },
              {
                type: 2,
                label: "🏠 Voltar",
                custom_id: "btn-back-to-categories",
                style: 2,
              },
            ],
          },
        ],
      },
    };
  }

  private getSubcategoriesForCategory(category: string) {
    const subcategories: Record<string, any[]> = {
      salas: [
        { label: "📏 Grande", value: "subcategory-salas-grande", description: "Salas grandes" },
        { label: "📏 Médio", value: "subcategory-salas-media", description: "Salas médias" },
        { label: "📏 Pequeno", value: "subcategory-salas-pequeno", description: "Salas pequenas" },
      ],
      hunt: [
        { label: "📏 Grande", value: "subcategory-hunt-grande", description: "Hunt grande" },
        { label: "📏 Médio", value: "subcategory-hunt-media", description: "Hunt médio" },
        { label: "📏 Pequeno", value: "subcategory-hunt-pequeno", description: "Hunt pequeno" },
      ],
      quest: [
        { label: "❄️ Snow", value: "subcategory-quest-snow", description: "Tema Snow" },
        { label: "🏜️ Desert", value: "subcategory-quest-desert", description: "Tema Desert" },
        { label: "🌿 Swamp", value: "subcategory-quest-swamp", description: "Tema Swamp" },
        { label: "🔥 Inferno", value: "subcategory-quest-inferno", description: "Tema Inferno" },
        { label: "⭐ Celestial", value: "subcategory-quest-celestial", description: "Tema Celestial" },
      ],
      city: [
        { label: "🎃 Halloween", value: "subcategory-city-halloween", description: "Tema Halloween" },
        { label: "🎄 Christmas", value: "subcategory-city-christmas", description: "Tema Christmas" },
        { label: "🐰 Easter", value: "subcategory-city-easter", description: "Tema Easter" },
      ],
    };

    return subcategories[category] || [];
  }

  private getMapsForSubcategory(category: string, subcategory: string): MapData[] {
    const allMaps: MapData[] = [
      {
        id: 1,
        name: "Sala Grande Premium",
        category: "salas",
        subcategory: "grande",
        price: 99.99,
        isActive: true,
      },
      {
        id: 2,
        name: "Sala Média Padrão",
        category: "salas",
        subcategory: "media",
        price: 79.99,
        isActive: true,
      },
      {
        id: 3,
        name: "Hunt Grande com Border",
        category: "hunt",
        subcategory: "grande",
        price: 89.99,
        isActive: true,
      },
      {
        id: 4,
        name: "Quest Snow Épica",
        category: "quest",
        subcategory: "snow",
        price: 109.99,
        isActive: true,
      },
      {
        id: 5,
        name: "City Halloween Assustadora",
        category: "city",
        subcategory: "halloween",
        price: 119.99,
        isActive: true,
      },
    ];

    return allMaps.filter(
      (m) => m.category === category && m.subcategory === subcategory
    );
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      salas: "🏰 Salas Especiais",
      hunt: "🎯 Hunt",
      quest: "⚔️ Quest",
      city: "🏙️ City",
    };
    return names[category] || category;
  }
}

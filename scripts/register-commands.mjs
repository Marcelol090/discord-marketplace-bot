import fetch from "node-fetch";

const DISCORD_API_URL = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1114181955634876478";

const commands = [
  {
    name: "shop",
    description: "Exibe a vitrine de produtos",
    options: [
      {
        name: "category",
        description: "Filtrar por categoria",
        type: 3, // STRING
        required: false,
      },
      {
        name: "page",
        description: "Número da página",
        type: 4, // INTEGER
        required: false,
      },
    ],
  },
  {
    name: "cart",
    description: "Visualiza seu carrinho de compras",
  },
  {
    name: "checkout",
    description: "Inicia o processo de checkout",
    options: [
      {
        name: "payment_method",
        description: "Método de pagamento (pix ou card)",
        type: 3, // STRING
        required: true,
        choices: [
          { name: "PIX", value: "pix" },
          { name: "Cartão de Crédito", value: "card" },
        ],
      },
    ],
  },
  {
    name: "orders",
    description: "Visualiza seus pedidos",
  },
  {
    name: "admin",
    description: "Painel administrativo (apenas para admins)",
  },
];

async function registerCommands() {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos slash...`);
    console.log(`📍 Guild ID: ${GUILD_ID}`);
    console.log(`🤖 Application ID: ${APPLICATION_ID}`);

    // Registrar comandos no servidor específico (mais rápido)
    const guildUrl = `${DISCORD_API_URL}/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`;

    for (const command of commands) {
      try {
        const response = await fetch(guildUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${BOT_TOKEN}`,
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error(`❌ Erro ao registrar ${command.name}: ${error}`);
          continue;
        }

        const data = await response.json();
        console.log(`✅ Comando registrado: /${command.name} (ID: ${data.id})`);
      } catch (error) {
        console.error(`❌ Erro ao registrar ${command.name}:`, error.message);
      }
    }

    console.log("\n✨ Comandos registrados com sucesso!");
    console.log("💡 Dica: Use /shop para ver a vitrine de produtos");
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error);
    process.exit(1);
  }
}

registerCommands();

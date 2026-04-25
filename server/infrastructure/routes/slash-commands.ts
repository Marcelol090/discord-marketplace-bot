import { Router } from "express";
import { SlashCommandRegistry } from "../discord/SlashCommandRegistry";

const router = Router();
const slashCommandRegistry = new SlashCommandRegistry();

/**
 * POST /api/discord/register-commands
 * Registra comandos slash globais no Discord
 */
router.post("/register-commands", async (req, res) => {
  try {
    console.log("🔄 Registrando comandos slash globais...");
    await slashCommandRegistry.registerGlobalCommands();
    res.json({
      success: true,
      message: "Comandos slash registrados com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao registrar comandos:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/discord/register-guild-commands
 * Registra comandos slash no servidor específico (mais rápido para testes)
 */
router.post("/register-guild-commands", async (req, res) => {
  try {
    console.log("🔄 Registrando comandos slash no servidor...");
    await slashCommandRegistry.registerGuildCommands();
    res.json({
      success: true,
      message: "Comandos slash do servidor registrados com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao registrar comandos do servidor:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/discord/commands
 * Obtém lista de comandos globais registrados
 */
router.get("/commands", async (req, res) => {
  try {
    const commands = await slashCommandRegistry.getGlobalCommands();
    res.json({
      success: true,
      commands,
    });
  } catch (error: any) {
    console.error("Erro ao obter comandos:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

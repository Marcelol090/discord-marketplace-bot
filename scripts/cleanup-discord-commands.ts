import "dotenv/config";

const appId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_SERVER_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!appId || !guildId || !token) {
  throw new Error("Missing DISCORD_APPLICATION_ID, DISCORD_SERVER_ID, or DISCORD_BOT_TOKEN");
}

const headers = {
  Authorization: `Bot ${token}`,
  "Content-Type": "application/json",
};

async function requestJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status === 429 && data?.retry_after) {
    const waitMs = Math.ceil(Number(data.retry_after) * 1000) + 250;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return requestJson(url, init);
  }

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${text}`);
  }

  return data;
}

async function deleteAllCommands(label: string, url: string) {
  const commands = await requestJson(url);

  if (!Array.isArray(commands)) {
    throw new Error(`Unexpected ${label} commands payload`);
  }

  console.log(`${label}-before: ${commands.map((command: any) => command.name).join(", ") || "<none>"}`);

  for (const command of commands) {
    await requestJson(`${url}/${command.id}`, { method: "DELETE" });
    console.log(`deleted ${label} command: ${command.name}`);
  }

  const remaining = await requestJson(url);
  console.log(`${label}-after: ${remaining.map((command: any) => command.name).join(", ") || "<none>"}`);
}

const globalCommandsUrl = `https://discord.com/api/v10/applications/${appId}/commands`;
const guildCommandsUrl = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;

await deleteAllCommands("global", globalCommandsUrl);
await deleteAllCommands("guild", guildCommandsUrl);
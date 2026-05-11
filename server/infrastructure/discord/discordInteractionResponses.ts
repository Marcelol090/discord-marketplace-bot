export interface DiscordInteractionResponsePayload {
  content?: string;
  embeds?: any[];
  components?: any[];
  flags?: number;
}

export interface DiscordInteractionResponseOptions extends DiscordInteractionResponsePayload {
  ephemeral?: boolean;
}

export function createMessageResponse(payload: DiscordInteractionResponsePayload) {
  return {
    type: 4,
    data: {
      ...payload,
      flags: payload.flags ?? 0,
    },
  };
}

export function createEphemeralResponse(payload: DiscordInteractionResponsePayload) {
  return {
    type: 4,
    data: {
      ...payload,
      flags: payload.flags ?? 64,
    },
  };
}

export function createEmbedResponse(options: DiscordInteractionResponseOptions) {
  const { ephemeral, ...payload } = options;

  return ephemeral
    ? createEphemeralResponse(payload)
    : createMessageResponse(payload);
}
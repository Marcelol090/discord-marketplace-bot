import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedOptions {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: string | { text: string; iconURL?: string };
  imageUrl?: string;
  thumbnailUrl?: string;
  timestamp?: Date | boolean;
  url?: string;
}

export function buildEmbed(options: DiscordEmbedOptions): EmbedBuilder {
  const embed = new EmbedBuilder();

  if (options.title) {
    embed.setTitle(options.title);
  }

  if (options.url) {
    embed.setURL(options.url);
  }

  if (options.description) {
    embed.setDescription(options.description);
  }

  if (options.color !== undefined) {
    embed.setColor(options.color);
  }

  if (options.fields?.length) {
    embed.addFields(options.fields);
  }

  if (options.thumbnailUrl) {
    embed.setThumbnail(options.thumbnailUrl);
  }

  if (options.imageUrl) {
    embed.setImage(options.imageUrl);
  }

  if (options.footer) {
    embed.setFooter(
      typeof options.footer === "string"
        ? { text: options.footer }
        : options.footer,
    );
  }

  if (options.timestamp) {
    embed.setTimestamp(options.timestamp === true ? new Date() : options.timestamp);
  }

  return embed;
}

export interface DiscordButtonConfig {
  label: string;
  style: ButtonStyle;
  customId?: string;
  url?: string;
  disabled?: boolean;
}

export function buildButton(config: DiscordButtonConfig): ButtonBuilder {
  const button = new ButtonBuilder().setLabel(config.label).setStyle(config.style);

  if (config.customId) {
    button.setCustomId(config.customId);
  }

  if (config.url) {
    button.setURL(config.url);
  }

  if (config.disabled !== undefined) {
    button.setDisabled(config.disabled);
  }

  return button;
}

export function buildButtonRow(buttons: DiscordButtonConfig[]): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons.map(buildButton));
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  emoji?: { name: string };
  description?: string;
  default?: boolean;
}

export interface DiscordSelectMenuOptions {
  customId: string;
  placeholder?: string;
  options: DiscordSelectOption[];
  minValues?: number;
  maxValues?: number;
}

export function buildSelectMenuRow(options: DiscordSelectMenuOptions): ActionRowBuilder<StringSelectMenuBuilder> {
  const menu = new StringSelectMenuBuilder().setCustomId(options.customId);

  if (options.placeholder) {
    menu.setPlaceholder(options.placeholder);
  }

  if (options.minValues !== undefined) {
    menu.setMinValues(options.minValues);
  }

  if (options.maxValues !== undefined) {
    menu.setMaxValues(options.maxValues);
  }

  menu.addOptions(options.options);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
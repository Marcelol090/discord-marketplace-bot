/**
 * Shared types for Discord interactions
 */

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
}

export interface DiscordMember {
  user: DiscordUser;
  roles: string[];
  nick?: string;
}

export interface DiscordInteractionData {
  id: string;
  name: string;
  type: number;
  options?: DiscordInteractionOption[];
  custom_id?: string;
  values?: string[];
}

export interface DiscordInteractionOption {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: DiscordInteractionOption[];
}

export interface DiscordInteraction {
  id: string;
  application_id: string;
  type: number; // 1 = PING, 2 = APPLICATION_COMMAND, 3 = MESSAGE_COMPONENT, 4 = APPLICATION_COMMAND_AUTOCOMPLETE, 5 = MODAL_SUBMIT
  data?: DiscordInteractionData;
  guild_id?: string;
  channel_id?: string;
  member?: DiscordMember;
  user?: DiscordUser;
  token: string;
  version: number;
  message?: DiscordMessage;
  app_permissions?: string;
  locale?: string;
  guild_locale?: string;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: string[];
  mention_channels?: DiscordChannel[];
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  reactions?: DiscordReaction[];
  nonce?: string | number;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  activity?: DiscordActivity;
  application?: DiscordApplication;
  message_reference?: DiscordMessageReference;
  flags?: number;
  stickers?: DiscordSticker[];
  referenced_message?: DiscordMessage | null;
  interaction?: DiscordMessageInteraction;
  thread?: DiscordChannel;
  components?: DiscordComponent[];
}

export interface DiscordChannel {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: DiscordPermissionOverwrite[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
  icon?: string;
  owner_id?: string;
  application_id?: string;
  managed?: boolean;
  parent_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: DiscordThreadMetadata;
  member?: DiscordThreadMember;
  default_auto_archive_duration?: number;
  permissions?: string;
}

export interface DiscordPermissionOverwrite {
  id: string;
  type: string;
  allow: string;
  deny: string;
}

export interface DiscordThreadMetadata {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked: boolean;
  create_timestamp?: string;
}

export interface DiscordThreadMember {
  id?: string;
  user_id?: string;
  join_timestamp: string;
  flags: number;
}

export interface DiscordAttachment {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedImage;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedImage {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordReaction {
  count: number;
  me: boolean;
  emoji: DiscordEmoji;
}

export interface DiscordEmoji {
  id?: string;
  name: string;
  roles?: string[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface DiscordActivity {
  name: string;
  type: number;
  url?: string;
  created_at: number;
  timestamps?: DiscordActivityTimestamps;
  application_id?: string;
  details?: string;
  state?: string;
  emoji?: DiscordEmoji;
  party?: DiscordActivityParty;
  assets?: DiscordActivityAssets;
  secrets?: DiscordActivitySecrets;
  instance?: boolean;
  flags?: number;
  buttons?: DiscordActivityButton[];
}

export interface DiscordActivityTimestamps {
  start?: number;
  end?: number;
}

export interface DiscordActivityParty {
  id?: string;
  size?: [number, number];
}

export interface DiscordActivityAssets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface DiscordActivitySecrets {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface DiscordActivityButton {
  label: string;
  url: string;
}

export interface DiscordApplication {
  id: string;
  name: string;
  icon?: string;
  description: string;
  rpc_origins?: string[];
  public: boolean;
  owner?: DiscordUser;
  summary: string;
  verify_key: string;
}

export interface DiscordMessageReference {
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
  fail_if_not_exists?: boolean;
}

export interface DiscordSticker {
  id: string;
  pack_id?: string;
  name: string;
  description?: string;
  tags: string;
  type: number;
  format_type: number;
  available?: boolean;
  guild_id?: string;
  user?: DiscordUser;
  sort_value?: number;
}

export interface DiscordMessageInteraction {
  id: string;
  type: number;
  name: string;
  user: DiscordUser;
  member?: DiscordMember;
}

export interface DiscordComponent {
  type: number; // 1 = ACTION_ROW, 2 = BUTTON, 3 = SELECT_MENU, 4 = TEXT_INPUT
  style?: number;
  label?: string;
  emoji?: DiscordEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  options?: DiscordSelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  components?: DiscordComponent[];
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: DiscordEmoji;
  default?: boolean;
}

export interface DiscordInteractionResponse {
  type: number; // 1 = PONG, 2 = CHANNEL_MESSAGE_WITH_SOURCE, 3 = DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, 4 = DEFERRED_UPDATE_MESSAGE, 5 = UPDATE_MESSAGE, 6 = APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, 7 = MODAL, 8 = PREMIUM_REQUIRED
  data?: DiscordInteractionResponseData;
}

export interface DiscordInteractionResponseData {
  tts?: boolean;
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: DiscordAllowedMentions;
  flags?: number;
  components?: DiscordComponent[];
  files?: DiscordFile[];
  attachments?: DiscordAttachment[];
  choices?: DiscordAutocompleteChoice[];
  custom_id?: string;
  title?: string;
}

export interface DiscordAllowedMentions {
  parse?: string[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface DiscordFile {
  id: number;
  filename: string;
  size: number;
  url: string;
}

export interface DiscordAutocompleteChoice {
  name: string;
  value: string | number;
  name_localizations?: Record<string, string>;
  value_localizations?: Record<string, string | number>;
}

export type MessageContent = string | {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
};

export type MessageType = {
  id?: number;
  role: "user" | "assistant" | "system";
  content: MessageContent | MessageContent[];
  timestamp?: Date;
  provider?: "openai" | "deepseek" | "openrouter";
  model?: string;
}

export type ConversationType = {
  id?: number;
  title: string;
  model: string;
  timestamp?: Date;
  messages?: MessageType[];
}

export type ModelParameters = {
  temperature: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  systemPrompt: string;
}

export type SettingsType = {
  darkMode: boolean;
  autoSave: boolean;
  model: string;
  apiProvider: "openai" | "deepseek" | "openrouter";
  modelParameters: ModelParameters;
}
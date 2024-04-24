export type ChatMessages = ChatMessage[];

export type ChatMessage = {
  id: number;
  role: "boos" | "user" | "assistant";
  name?: string;
  content: string;
  date: [string, string];
  avatar: string | ChatAvatar;
  url?: string;
  data?: Record<string, any>;
};

export type ChatInput = {
  role: "user" | "assistant";
  name?: string;
  content: string;
  input: boolean;
  avatar?: ChatAvatar;
};
export type ChatAvatar = {
  icon?: string;
  color?: string;
};

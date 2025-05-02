export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
  {
    id: 'deepseek-chat',
    name: 'Deepseek Chat',
    description: 'Deepseek chat model',
  },
  {
    id: 'deepseek-reasoning',
    name: 'Deepseek Reasoning',
    description: 'Deepseek reasoning model',
  },
];

export const DEFAULT_CHAT_PROVIDER: string = 'openai';

interface ChatProvider {
  id: string;
  name: string;
  description: string;
}

export const chatProviders: Array<ChatProvider> = [
  {
    id: 'openai',
    name: 'ChatGPT', 
    description: 'Advanced models from OpenAI',
  },
  {
    id: 'deepseek',
    name: 'Deepseek', 
    description: 'Open source models from Deepseek',
  },

];

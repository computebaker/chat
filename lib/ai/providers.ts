import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// instantiate OpenRouter-compatible client
const openaiRouter = createOpenAICompatible({
  baseURL: "https://openrouter.ai/api/v1",
  name: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://tekir.co',
    'X-Title': 'Tekir',
  },
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openaiRouter.chatModel('openai/gpt-4o-mini'),
        'chat-model-reasoning': wrapLanguageModel({ model: openaiRouter.chatModel('openai/gpt-4o-mini'), middleware: extractReasoningMiddleware({ tagName: 'think' }) }),
        'title-model': openaiRouter.chatModel('openai/gpt-4o-mini'),
        'artifact-model': openaiRouter.chatModel('openai/gpt-4o-mini'),
        'deepseek-chat': openaiRouter.chatModel('deepseek/deepseek-chat-v3-0324'), // Updated model ID
        'deepseek-reasoning': wrapLanguageModel({ model: openaiRouter.chatModel('deepseek/deepseek-r1'), middleware: extractReasoningMiddleware({ tagName: 'think' }) }), // Updated model ID
      },
    });

// ZOL now uses OpenAI. This file is kept so any stale imports fail with a clear error.
export function getAnthropicClient(): never {
  throw new Error('Anthropic has been removed. Use getOpenAIClient() from @/lib/openai/client instead.')
}

import { ChatMessage, OpenRouterModel, ToolCall, ToolDefinition } from '../types';

export class OpenRouterService {
  private static BASE_URL = 'https://openrouter.ai/api/v1';

  /**
   * Validate API key by pinging OpenRouter auth/key endpoint
   */
  static async validateApiKey(apiKey: string): Promise<{ valid: boolean; message: string; data?: any }> {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, message: 'API key is empty.' };
    }

    try {
      const response = await fetch(`${this.BASE_URL}/auth/key`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const label = data?.data?.label || 'Active';
        const limit = data?.data?.limit != null ? `$${data.data.limit}` : 'No limit';
        const usage = data?.data?.usage != null ? `$${data.data.usage.toFixed(4)}` : 'N/A';
        return {
          valid: true,
          message: `Key valid (${label}). Usage: ${usage} / ${limit}`,
          data: data.data,
        };
      } else {
        const err = await response.json().catch(() => ({}));
        return {
          valid: false,
          message: err?.error?.message || `HTTP ${response.status}: Unauthorized or Invalid Key`,
        };
      }
    } catch (e: any) {
      return {
        valid: false,
        message: `Network failure connecting to OpenRouter: ${e.message}`,
      };
    }
  }

  /**
   * Dynamically fetch live OpenRouter models catalog
   */
  static async fetchModels(apiKey?: string): Promise<OpenRouterModel[]> {
    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      }

      const response = await fetch(`${this.BASE_URL}/models`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: HTTP ${response.status}`);
      }

      const json = await response.json();
      const rawModels = json.data || [];

      return rawModels.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        description: m.description,
        context_length: m.context_length || 4096,
        pricing: {
          prompt: m.pricing?.prompt || '0',
          completion: m.pricing?.completion || '0',
        },
        supports_tools: m.description?.toLowerCase().includes('tool') || 
                        m.id.includes('claude') || 
                        m.id.includes('gpt-4') || 
                        m.id.includes('gemini') || 
                        m.id.includes('llama-3.3') ||
                        m.id.includes('qwen'),
        architecture: m.architecture,
      }));
    } catch (error) {
      console.warn('Could not load dynamic OpenRouter models, returning curated list:', error);
      return this.getFallbackModels();
    }
  }

  static getFallbackModels(): OpenRouterModel[] {
    return [
      {
        id: 'google/gemini-2.5-flash',
        name: 'Google: Gemini 2.5 Flash',
        description: 'Next-gen multimodal workhorse model with 1M context, high speed, and robust tool calling.',
        context_length: 1048576,
        pricing: { prompt: '0.000000075', completion: '0.0000003' },
        supports_tools: true,
      },
      {
        id: 'anthropic/claude-3.7-sonnet',
        name: 'Anthropic: Claude 3.7 Sonnet',
        description: 'Hybrid reasoning and state-of-the-art coding and agentic tool use.',
        context_length: 200000,
        pricing: { prompt: '0.000003', completion: '0.000015' },
        supports_tools: true,
      },
      {
        id: 'openai/gpt-4o',
        name: 'OpenAI: GPT-4o',
        description: 'Flagship omni model optimized for complex multi-step reasoning and function calling.',
        context_length: 128000,
        pricing: { prompt: '0.0000025', completion: '0.00001' },
        supports_tools: true,
      },
      {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek: R1 (Reasoning)',
        description: 'Open-weights reasoning model with high math, logic, and chain-of-thought capabilities.',
        context_length: 64000,
        pricing: { prompt: '0.00000055', completion: '0.00000219' },
        supports_tools: false,
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Meta: Llama 3.3 70B Instruct',
        description: 'Open multilingual model rivaling closed frontier architectures with tool calling.',
        context_length: 131072,
        pricing: { prompt: '0.00000012', completion: '0.0000003' },
        supports_tools: true,
      },
      {
        id: 'qwen/qwen-2.5-coder-32b-instruct',
        name: 'Qwen: Qwen 2.5 Coder 32B Instruct',
        description: 'Specialized code generation, debugging, and terminal tool automation.',
        context_length: 131072,
        pricing: { prompt: '0.00000006', completion: '0.00000015' },
        supports_tools: true,
      }
    ];
  }

  /**
   * Stream a chat completion with SSE parsing and tool call extraction
   */
  static async streamChatCompletion({
    apiKey,
    model,
    messages,
    tools,
    temperature = 0.7,
    maxTokens = 4096,
    signal,
    onChunk,
    onToolCalls,
  }: {
    apiKey: string;
    model: string;
    messages: { role: string; content: string; tool_calls?: any[]; tool_call_id?: string; name?: string }[];
    tools?: ToolDefinition[];
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
    onChunk: (chunk: string) => void;
    onToolCalls?: (toolCalls: ToolCall[]) => void;
  }): Promise<{ content: string; toolCalls?: ToolCall[] }> {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required. Please add your key in Settings.');
    }

    // Format tools for OpenAI/OpenRouter format
    const formattedTools = tools && tools.length > 0
      ? tools.filter(t => t.enabled).map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          }
        }))
      : undefined;

    const body: Record<string, any> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    if (formattedTools && formattedTools.length > 0) {
      body.tools = formattedTools;
      body.tool_choice = 'auto';
    }

    const response = await fetch(`${this.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://vladimir.ai',
        'X-Title': 'VLADIMIR AI Android Agent',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      if (response.status === 401) {
        throw new Error(`OpenRouter Authentication Failed: ${errMsg}. Check your API key in Settings.`);
      } else if (response.status === 402) {
        throw new Error(`Insufficient OpenRouter Credits: ${errMsg}. Top up credits on openrouter.ai.`);
      } else if (response.status === 429) {
        throw new Error(`Rate Limit Exceeded: ${errMsg}. Please wait a moment before retrying.`);
      }
      throw new Error(`OpenRouter Error (${response.status}): ${errMsg}`);
    }

    if (!response.body) {
      throw new Error('No response body returned from OpenRouter.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let accumulatedToolCalls: Record<number, { id: string; name: string; arguments: string }> = {};

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // keepalive comment
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;

            if (delta) {
              if (delta.content) {
                fullContent += delta.content;
                onChunk(delta.content);
              }

              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index ?? 0;
                  if (!accumulatedToolCalls[idx]) {
                    accumulatedToolCalls[idx] = {
                      id: tc.id || `call_${Date.now()}_${idx}`,
                      name: tc.function?.name || '',
                      arguments: tc.function?.arguments || '',
                    };
                  } else {
                    if (tc.function?.name) {
                      accumulatedToolCalls[idx].name += tc.function.name;
                    }
                    if (tc.function?.arguments) {
                      accumulatedToolCalls[idx].arguments += tc.function.arguments;
                    }
                  }
                }
              }
            }
          } catch (e) {
            // Ignore partial SSE chunk parsing
          }
        }
      }
    }

    const toolCallsList: ToolCall[] = Object.values(accumulatedToolCalls).map(tc => ({
      id: tc.id,
      type: 'function',
      function: {
        name: tc.name,
        arguments: tc.arguments,
      }
    }));

    if (toolCallsList.length > 0 && onToolCalls) {
      onToolCalls(toolCallsList);
    }

    return {
      content: fullContent,
      toolCalls: toolCallsList.length > 0 ? toolCallsList : undefined,
    };
  }
}

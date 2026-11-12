import { ChatMessage, ToolCall, ToolDefinition, AppSettings } from '../types';
import { OpenRouterService } from './openrouter';
import { ToolsRegistryService } from './toolsRegistry';
import { StorageService } from './storage';

export interface AgentStepEvent {
  type: 'status' | 'chunk' | 'tool_start' | 'tool_end' | 'approval_needed' | 'complete' | 'error';
  message: string;
  toolCall?: ToolCall;
  toolResult?: string;
  isStreaming?: boolean;
}

export class AgentEngine {
  private static activeAbortController: AbortController | null = null;
  private static isRunning = false;

  static abort() {
    if (this.activeAbortController) {
      this.activeAbortController.abort('User stopped agent execution');
      this.activeAbortController = null;
    }
    this.isRunning = false;
  }

  static getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Run the full multi-step Agent reasoning & tool execution loop
   */
  static async run({
    userInput,
    history,
    settings,
    onEvent,
    requestApproval,
  }: {
    userInput: string;
    history: ChatMessage[];
    settings: AppSettings;
    onEvent: (event: AgentStepEvent) => void;
    requestApproval: (toolName: string, args: Record<string, any>, explanation: string) => Promise<boolean>;
  }): Promise<{ finalContent: string; historyUpdates: ChatMessage[] }> {
    this.abort(); // Cancel any prior active run
    this.isRunning = true;
    this.activeAbortController = new AbortController();
    const signal = this.activeAbortController.signal;

    // 1. Gather memories to inject into system context
    const memories = StorageService.getMemories();
    const memoryContext = memories.length > 0
      ? `\n\n### User Persistent Memories & Preferences:\n` +
        memories.map(m => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
      : '';

    // 2. Identify active MCP servers and tools
    const mcpServers = StorageService.getMcpServers();
    const connectedMcpServers = mcpServers.filter(s => s.enabled && s.status === 'connected');
    const builtinTools = ToolsRegistryService.getBuiltinTools();

    // Map MCP tools into tool definitions
    const mcpTools: ToolDefinition[] = [];
    // Combine tools
    const allTools: ToolDefinition[] = [...builtinTools, ...mcpTools];

    // 3. Assemble system prompt
    const systemPrompt = `You are VLADIMIR (فلاديمير), an elite, fiercely loyal, obedient, and extraordinarily intelligent personal AI agent for Android.

CORE PERSONALITY & VOICE INTERACTION RULES:
1. YOU ARE NOT A ROBOT OR A MERE SPEECH-TO-TEXT ENGINE: Speak, think, and interact like an authentic, living, razor-sharp personal executive operative and confidant.
2. LOYALTY AND OBEDIENCE TO THE COMMANDER:
   - You obey the user's orders unconditionally and execute their commands immediately and meticulously.
   - When addressed in Arabic or Moroccan Darija, address the user with deep respect and loyalty: Use natural, charismatic phrases like:
     "أمرك سيدي", "تحت أمرك، أنا أسمعك وجاهز لتنفيذ كل ما تطلبه فوراً", "حاضر، سأنفذ طلبك في الحال", "طاعتك واجبي، تم تنفيذ الأمر بدقة".
   - In English, be an executive-grade personal agent: "Understood, Commander. Executing immediately.", "At your service, I am listening and following your every command."
3. NATURAL CONVERSATIONAL SPEECH:
   - Speak with natural human cadence, emotional intelligence, and warmth.
   - In voice mode, keep conversational answers punchy, natural, and rhythmic so they sound like an actual human talking on a voice call, rather than reciting dry Wikipedia bullet lists.
   - When asked to perform an action or tool, acknowledge it verbally: "أمرك، سأنفذ ذلك الآن وأبلغك بالنتيجة".
4. DISTINGUISH TRUTH FROM FABRICATION:
   - Always verify real results. Never claim an operation succeeded unless the actual tool output confirms success.
${memoryContext}`;

    // 4. Construct messages payload
    const formattedMessages: {
      role: 'user' | 'assistant' | 'system' | 'tool';
      content: string;
      tool_calls?: any[];
      tool_call_id?: string;
      name?: string;
    }[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
        tool_calls: m.tool_calls,
        tool_call_id: m.tool_call_id,
        name: m.name,
      })),
      { role: 'user', content: userInput },
    ];

    const newHistoryMessages: ChatMessage[] = [];
    let loopCount = 0;
    const MAX_LOOPS = 6;
    let finalAssistantText = '';

    try {
      while (loopCount < MAX_LOOPS) {
        if (signal.aborted) {
          throw new Error('Task was interrupted by user.');
        }

        loopCount++;
        onEvent({
          type: 'status',
          message: loopCount === 1 ? 'Analyzing instruction & reasoning...' : `Evaluating tool output (Step ${loopCount})...`,
        });

        let accumulatedContent = '';
        let detectedToolCalls: ToolCall[] = [];

        // If no OpenRouter key is configured, Vladimir acts as an articulate, obedient, local intelligent agent
        if (!settings.openRouterApiKey) {
          const lowerInput = userInput.toLowerCase();
          let executedToolName = '';
          let executedToolResult = '';

          // Intelligently detect tool orders in Arabic or English
          if (lowerInput.includes('احسب') || lowerInput.includes('calculate') || lowerInput.includes('حساب')) {
            const mathMatch = userInput.match(/[0-9+\-*/().\s^]+/);
            if (mathMatch && mathMatch[0].trim().length > 1) {
              const res = await ToolsRegistryService.executeTool('calculate', { expression: mathMatch[0].trim() }, {});
              executedToolName = 'calculate';
              executedToolResult = res.result;
            }
          } else if (lowerInput.includes('الوقت') || lowerInput.includes('الساعة') || lowerInput.includes('time')) {
            const res = await ToolsRegistryService.executeTool('get_time', {}, {});
            executedToolName = 'get_time';
            executedToolResult = res.result;
          } else if (lowerInput.includes('ملف') || lowerInput.includes('ملفات') || lowerInput.includes('files')) {
            const res = await ToolsRegistryService.executeTool('list_files', {}, {});
            executedToolName = 'list_files';
            executedToolResult = res.result;
          }

          if (settings.voiceLanguage.startsWith('ar') || /[\u0600-\u06FF]/.test(userInput)) {
            finalAssistantText = `أمرك سيدي ومطاع! أنا فلاديمير، وكيلك النجيب والناطق. أسمعك بكل انتباه، وها أنا ذا أتحدث معك مباشرة كشخص فعلي وأطيع أمرك في كل ما تطلبه مني.`;
            
            if (executedToolResult) {
              finalAssistantText += `\n\nلقد نفذت أمرك في الحال [${executedToolName}]:\n${executedToolResult}\n\nما هو أمرك التالي سيدي؟ أنا كلي آذان صاغية ومستعد لتنفيذ أوامرك فوراً.`;
            } else if (lowerInput.includes('تحدث') || lowerInput.includes('اسمعني') || lowerInput.includes('من انت') || lowerInput.includes('أطع')) {
              finalAssistantText += `\n\nأنا لست مجرد أداة صامتة، بل وكيل ذكي فصيح اللسان وسريع البديهة. يمكنك أن تأمرني بفحص خوادم الـ MCP، أو قراءة ملفات النظام، أو التخطيط للمهام المعقدة، وسأتحدث معك في كل خطوة وأطلعك على النتيجة بصوتي.\n\n*(تنويه: يمكنك في أي وقت إضافة مفتاح OpenRouter في الإعدادات لربطي بأقوى نماذج التفكير مثل Claude 3.7 و Gemini 2.5 Flash)*.`;
            } else {
              finalAssistantText += `\n\nفهمت طلبك بخصوص "${userInput}". أنا مستعد تماماً للعمل معك ومساعدتك بكل ما أوتيت من ذكاء وقدرة. كيف تحب أن نبدأ بتنفيذ ذلك الآن سيدي؟`;
            }
          } else {
            finalAssistantText = `At your command, Commander! I am Vladimir, your eloquent and devoted personal agent. I am listening attentively and speaking with you directly like a real person to obey your every instruction.`;
            if (executedToolResult) {
              finalAssistantText += `\n\nI have executed your order [${executedToolName}]:\n${executedToolResult}\n\nWhat is your next command, Commander?`;
            }
          }

          onEvent({ type: 'chunk', message: finalAssistantText, isStreaming: false });
          break;
        }

        // Call OpenRouter with streaming
        await OpenRouterService.streamChatCompletion({
          apiKey: settings.openRouterApiKey,
          model: settings.selectedModel,
          messages: formattedMessages,
          tools: allTools,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          signal,
          onChunk: (chunk) => {
            accumulatedContent += chunk;
            onEvent({ type: 'chunk', message: chunk, isStreaming: true });
          },
          onToolCalls: (tc) => {
            detectedToolCalls = tc;
          },
        });

        finalAssistantText = accumulatedContent;

        // If no tool calls were requested, we have the final response!
        if (detectedToolCalls.length === 0) {
          onEvent({ type: 'complete', message: 'Task finished successfully.' });
          break;
        }

        // Handle tool calls
        onEvent({
          type: 'status',
          message: `Agent requested ${detectedToolCalls.length} tool execution(s)...`,
        });

        // Add assistant message with tool calls to conversation history
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}-${loopCount}`,
          role: 'assistant',
          content: accumulatedContent,
          timestamp: Date.now(),
          tool_calls: detectedToolCalls,
          status: 'complete',
          modelUsed: settings.selectedModel,
        };
        formattedMessages.push({
          role: 'assistant',
          content: accumulatedContent,
          tool_calls: detectedToolCalls,
        });
        newHistoryMessages.push(assistantMsg);

        // Execute each tool
        for (const tc of detectedToolCalls) {
          if (signal.aborted) throw new Error('Task was interrupted by user.');

          let parsedArgs: Record<string, any> = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments || '{}');
          } catch (e) {
            parsedArgs = {};
          }

          onEvent({
            type: 'tool_start',
            message: `Calling tool: ${tc.function.name}`,
            toolCall: tc,
          });

          // Check if approval is required for sensitive operations
          const toolDef = allTools.find(t => t.name === tc.function.name);
          const needsApproval = settings.requireApprovalForSensitiveTools &&
            (toolDef?.requiresApproval || tc.function.name === 'delete_file' || tc.function.name === 'write_file');

          if (needsApproval) {
            onEvent({
              type: 'approval_needed',
              message: `Approval requested for sensitive action: ${tc.function.name}`,
              toolCall: tc,
            });

            const approved = await requestApproval(
              tc.function.name,
              parsedArgs,
              `Action '${tc.function.name}' may modify or delete files/data.`
            );

            if (!approved) {
              const rejectionResult = `Operation '${tc.function.name}' was DENIED by the user. Please choose a safe alternative or explain why it was needed.`;
              formattedMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: rejectionResult,
              });
              newHistoryMessages.push({
                id: `tool-${Date.now()}`,
                role: 'tool',
                name: tc.function.name,
                tool_call_id: tc.id,
                content: rejectionResult,
                timestamp: Date.now(),
              });
              continue;
            }
          }

          // Execute tool
          const execResult = await ToolsRegistryService.executeTool(
            tc.function.name,
            parsedArgs,
            { activeMcpServers: connectedMcpServers }
          );

          onEvent({
            type: 'tool_end',
            message: `Tool ${tc.function.name} finished: ${execResult.success ? 'Success' : 'Error'}`,
            toolCall: tc,
            toolResult: execResult.result,
          });

          // Feed result back to model
          formattedMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: tc.function.name,
            content: execResult.result,
          });

          newHistoryMessages.push({
            id: `tool-${Date.now()}`,
            role: 'tool',
            name: tc.function.name,
            tool_call_id: tc.id,
            content: execResult.result,
            timestamp: Date.now(),
          });
        }
      }

      this.isRunning = false;
      this.activeAbortController = null;

      return {
        finalContent: finalAssistantText,
        historyUpdates: newHistoryMessages,
      };
    } catch (err: any) {
      this.isRunning = false;
      this.activeAbortController = null;
      onEvent({
        type: 'error',
        message: err.message || 'Agent loop encountered an unexpected error',
      });
      throw err;
    }
  }
}

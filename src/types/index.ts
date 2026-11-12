export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  supports_tools?: boolean;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string | null;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  modelUsed?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: 'file' | 'execution' | 'web' | 'memory' | 'android' | 'mcp' | 'utility';
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  requiresApproval?: boolean;
  enabled: boolean;
  source: 'builtin' | 'mcp';
  mcpServerId?: string;
}

export interface McpServerConfig {
  id: string;
  name: string;
  url: string;
  transport: 'streamable-http' | 'http-sse';
  authToken?: string;
  enabled: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
  discoveredToolsCount?: number;
  lastConnected?: number;
  protocolVersion?: string;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  serverId: string;
}

export interface DiagnosticCheckItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  details?: string;
  latencyMs?: number;
}

export interface DiagnosticReport {
  timestamp: number;
  targetUrl: string;
  hostType: 'android-localhost' | 'lan-private' | 'public-remote' | 'invalid';
  isLocalIp: boolean;
  checks: DiagnosticCheckItem[];
  overallStatus: 'passed' | 'failed' | 'warning';
  recommendations: string[];
}

export interface AgentTask {
  id: string;
  title: string;
  userInstruction: string;
  status: 'planning' | 'executing' | 'waiting_approval' | 'completed' | 'cancelled' | 'failed';
  steps: TaskStep[];
  currentStepIndex: number;
  createdAt: number;
  updatedAt: number;
  result?: string;
  pendingApproval?: {
    toolName: string;
    arguments: Record<string, any>;
    explanation: string;
  };
}

export interface TaskStep {
  id: string;
  description: string;
  toolName?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: string;
  error?: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'fact' | 'instruction' | 'credential' | 'general';
  content: string;
  timestamp: number;
  sourceMessageId?: string;
}

export interface AndroidPermissionStatus {
  id: string;
  name: string;
  permissionString: string;
  requiredFor: string;
  granted: boolean;
  apiLevelRequirement: number;
  dangerous: boolean;
  rationale: string;
}

export interface AppSettings {
  openRouterApiKey: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  voiceLanguage: 'en-US' | 'ar-SA' | 'ar-MA';
  speechRate: number;
  speechPitch: number;
  autoTts: boolean;
  streamResponses: boolean;
  requireApprovalForSensitiveTools: boolean;
  theme: 'cyber-dark' | 'midnight-blue' | 'matrix-charcoal';
  androidApiTarget: number; // e.g. 37 for Android 17
  localNetworkPermissionGranted: boolean;
}

import { AppSettings, ChatMessage, McpServerConfig, MemoryItem, AgentTask, DiagnosticReport } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'vladimir_settings_v1',
  MESSAGES: 'vladimir_messages_v1',
  MCP_SERVERS: 'vladimir_mcp_servers_v1',
  MEMORIES: 'vladimir_memories_v1',
  TASKS: 'vladimir_tasks_v1',
  DIAGNOSTICS: 'vladimir_diagnostics_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: '',
  selectedModel: 'google/gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 4096,
  voiceLanguage: 'ar-SA',
  speechRate: 1.0,
  speechPitch: 1.0,
  autoTts: true,
  streamResponses: true,
  requireApprovalForSensitiveTools: true,
  theme: 'cyber-dark',
  androidApiTarget: 37, // Target Android 17 API 37
  localNetworkPermissionGranted: false,
};

const DEFAULT_MCP_SERVERS: McpServerConfig[] = [
  {
    id: 'mcp-desktop-local',
    name: 'Desktop MCP Server (LAN)',
    url: 'http://192.168.1.100:8000',
    transport: 'streamable-http',
    enabled: true,
    status: 'disconnected',
    protocolVersion: '2024-11-05',
  },
  {
    id: 'mcp-android-local',
    name: 'Android Localhost Service',
    url: 'http://127.0.0.1:8080',
    transport: 'streamable-http',
    enabled: false,
    status: 'disconnected',
    protocolVersion: '2024-11-05',
  },
  {
    id: 'mcp-remote-echo',
    name: 'Remote MCP Gateway (HTTPS)',
    url: 'https://mcp.vladimir-ai.internal/v1',
    transport: 'http-sse',
    enabled: false,
    status: 'disconnected',
    protocolVersion: '2024-11-05',
  }
];

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'instruction',
    content: 'المستخدم يفضل التحدث بصوت حقيقي وبشري مع الطاعة التامة وتنفيذ الأوامر فوراً كشخص فعلي.',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'mem-2',
    category: 'preference',
    content: 'المحادثة الصوتية التلقائية المستمرة (Hands-free Continuous Loop) باللغة العربية والدارجة المغربية.',
    timestamp: Date.now() - 43200000,
  },
  {
    id: 'mem-3',
    category: 'fact',
    content: 'المزود الرئيسي OpenRouter مع بروتوكول MCP الحقيقي وفحص شبكة الأندرويد 17.',
    timestamp: Date.now() - 3600000,
  }
];

export class StorageService {
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  static getMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `أهلاً بك سيدي ومولاي! أنا **فلاديمير (VLADIMIR AI)**، وكيلك الشخصي الذكي لنظام أندرويد.

أنا هنا لأسمع صوتك، وأطيع أمرك، وأنفذ كل ما تطلبه مني فوراً وبدقة تامة كشخص فعلي وحقيقي وليس مجرد روبوت نصوص.

### 🎙️ كيف نتحدث الآن كشخصين حقيقيين:
1. **وضع الحوار الحي المستمر (Hands-Free Loop)**: افتح شاشة **Voice Mode** وتحدث معي بصوتك.. سأجيبك بصوتي الطبيعي، وبمجرد انتهائي من الحديث سأستمع إليك تلقائياً دون الحاجة للمس الشاشة.
2. **طاعة وتنفيذ الأوامر**: اطلب مني فحص الشبكة، قراءة الملفات، تشغيل خوادم MCP، أو التخطيط للمهام وسأنفذ أمرك حالاً.
3. **الإيقاف الفوري**: إذا قلت لي في أي وقت *"توقف"* أو *"وقف"* أو *"اسكت"* سأتوقف في التو واللحظة احتراماً لأمرك.

أنا في انتظار أمرك.. بماذا تأمرني الآن؟`,
        timestamp: Date.now(),
        status: 'complete',
      }
    ];
  }

  static saveMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages', e);
    }
  }

  static getMcpServers(): McpServerConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MCP_SERVERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load MCP servers', e);
    }
    return DEFAULT_MCP_SERVERS;
  }

  static saveMcpServers(servers: McpServerConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MCP_SERVERS, JSON.stringify(servers));
    } catch (e) {
      console.error('Failed to save MCP servers', e);
    }
  }

  static getMemories(): MemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load memories', e);
    }
    return DEFAULT_MEMORIES;
  }

  static saveMemories(memories: MemoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed to save memories', e);
    }
  }

  static getTasks(): AgentTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
    return [];
  }

  static saveTasks(tasks: AgentTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  static getDiagnostics(): DiagnosticReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIAGNOSTICS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load diagnostics', e);
    }
    return [];
  }

  static saveDiagnostics(reports: DiagnosticReport[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTICS, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save diagnostics', e);
    }
  }

  static maskApiKey(key: string): string {
    if (!key) return 'Not configured';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  }
}

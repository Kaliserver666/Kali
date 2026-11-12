import { McpServerConfig, McpTool } from '../types';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class McpClientService {
  private static PROTOCOL_VERSION = '2024-11-05';

  /**
   * Perform genuine MCP handshake and return discovered tools
   */
  static async connectAndDiscover(server: McpServerConfig): Promise<{
    success: boolean;
    serverInfo?: any;
    protocolVersion?: string;
    tools: McpTool[];
    error?: string;
    latencyMs?: number;
  }> {
    const startTime = performance.now();
    try {
      // 1. Initialize Handshake
      const initPayload: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: `init-${Date.now()}`,
        method: 'initialize',
        params: {
          protocolVersion: this.PROTOCOL_VERSION,
          capabilities: {
            roots: { listChanged: false },
            sampling: {},
          },
          clientInfo: {
            name: 'VLADIMIR AI Android Agent',
            version: '1.0.0',
          },
        },
      };

      const initResponse = await this.sendJsonRpc(server, initPayload);
      if (initResponse.error) {
        return {
          success: false,
          error: `MCP Initialization Rejected: [Code ${initResponse.error.code}] ${initResponse.error.message}`,
          tools: [],
        };
      }

      const serverInfo = initResponse.result?.serverInfo;
      const negotiatedVersion = initResponse.result?.protocolVersion || this.PROTOCOL_VERSION;

      // 2. Send initialized notification (no response expected)
      try {
        await this.sendNotification(server, {
          jsonrpc: '2.0',
          method: 'notifications/initialized',
          params: {},
        });
      } catch (e) {
        // notification failures can be non-fatal on some HTTP transports
      }

      // 3. Discover Tools via tools/list
      const toolsPayload: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: `tools-${Date.now()}`,
        method: 'tools/list',
        params: {},
      };

      const toolsResponse = await this.sendJsonRpc(server, toolsPayload);
      const rawTools = toolsResponse.result?.tools || [];

      const tools: McpTool[] = rawTools.map((t: any) => ({
        name: t.name,
        description: t.description || `MCP tool from ${server.name}`,
        inputSchema: t.inputSchema || { type: 'object', properties: {} },
        serverId: server.id,
      }));

      const latencyMs = Math.round(performance.now() - startTime);

      return {
        success: true,
        serverInfo,
        protocolVersion: negotiatedVersion,
        tools,
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unknown network error communicating with MCP server',
        tools: [],
      };
    }
  }

  /**
   * Execute an MCP Tool Call
   */
  static async callTool(
    server: McpServerConfig,
    toolName: string,
    toolArguments: Record<string, any>
  ): Promise<{ success: boolean; result: any; isError?: boolean }> {
    try {
      const payload: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: `call-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArguments,
        },
      };

      const response = await this.sendJsonRpc(server, payload);

      if (response.error) {
        return {
          success: false,
          isError: true,
          result: `MCP Tool Error [${response.error.code}]: ${response.error.message}`,
        };
      }

      const content = response.result?.content;
      let textResult = '';
      if (Array.isArray(content)) {
        textResult = content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
      } else {
        textResult = typeof response.result === 'string' ? response.result : JSON.stringify(response.result, null, 2);
      }

      return {
        success: !response.result?.isError,
        isError: !!response.result?.isError,
        result: textResult || '(Tool completed with empty output)',
      };
    } catch (e: any) {
      return {
        success: false,
        isError: true,
        result: `Failed to call MCP tool '${toolName}': ${e.message}`,
      };
    }
  }

  /**
   * Low-level JSON-RPC transport dispatch
   */
  private static async sendJsonRpc(
    server: McpServerConfig,
    payload: JsonRpcRequest
  ): Promise<JsonRpcResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (server.authToken) {
      headers['Authorization'] = `Bearer ${server.authToken.trim()}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(server.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} (${res.statusText}): ${text.slice(0, 150)}`);
      }

      return await res.json();
    } catch (e: any) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') {
        throw new Error(`Connection timed out after 8s attempting to reach ${server.url}`);
      }
      throw e;
    }
  }

  private static async sendNotification(
    server: McpServerConfig,
    payload: { jsonrpc: '2.0'; method: string; params?: any }
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (server.authToken) {
      headers['Authorization'] = `Bearer ${server.authToken.trim()}`;
    }

    await fetch(server.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

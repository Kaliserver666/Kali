import React, { useState } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  Clock,
  ExternalLink,
  Info,
} from 'lucide-react';
import { DiagnosticReport, AppSettings } from '../types';
import { NetworkDiagnosticsService } from '../services/networkDiagnostics';

interface DiagnosticsScreenProps {
  initialUrl?: string;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = ({
  initialUrl = 'http://192.168.1.100:8000',
  settings,
  onUpdateSettings,
}) => {
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const handleRunDiagnostics = async () => {
    setIsRunning(true);
    try {
      const res = await NetworkDiagnosticsService.runDiagnostics({
        url: targetUrl.trim(),
        androidApiLevel: settings.androidApiTarget,
        localNetworkPermissionGranted: settings.localNetworkPermissionGranted,
      });
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const samplePresets = [
    { label: 'LAN MCP (192.168.1.100)', url: 'http://192.168.1.100:8000' },
    { label: 'Android Localhost (127.0.0.1)', url: 'http://127.0.0.1:8080' },
    { label: 'Remote HTTPS Gateway', url: 'https://mcp.vladimir-ai.internal/v1' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          MCP Connection Diagnostics & Local Network Analyzer
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Diagnose local network socket failures, resolve <code>127.0.0.1</code> vs Wi-Fi LAN routing, and verify Android 17 (API 37) <code>ACCESS_LOCAL_NETWORK</code> security.
        </p>
      </div>

      {/* Target URL Input Panel */}
      <div className="p-6 rounded-2xl bg-[#0b0f19] border border-purple-500/30 space-y-4 shadow-xl">
        <label className="text-xs font-semibold text-slate-300 block">
          Target MCP Endpoint URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="http://192.168.1.100:8000"
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 outline-none"
          />
          <button
            onClick={handleRunDiagnostics}
            disabled={isRunning || !targetUrl.trim()}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs hover:scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 transition-all shrink-0"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running 10 Checks...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500">Presets:</span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setTargetUrl(preset.url)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-cyan-400 border border-slate-800 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crucial Network Architecture Explainer Card */}
      <div className="p-5 rounded-2xl bg-[#0e1424] border border-cyan-500/30 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Info className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-sm">Critical: Understanding Android Local Network Architecture</h3>
        </div>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Why did prior attempts fail with "Unable to connect to local network addresses"?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>
              <strong className="text-slate-200">127.0.0.1 (Localhost):</strong> On an Android device, <code>127.0.0.1</code> refers exclusively to the <em>Android phone itself</em>. If your MCP server is running on your Mac/Windows PC, the phone cannot find it at 127.0.0.1!
            </li>
            <li>
              <strong className="text-slate-200">Wi-Fi LAN IP (192.168.x.x / 10.x.x.x):</strong> You must specify the workstation's actual private Wi-Fi IP address so the Android device routes packets across your local router subnet.
            </li>
            <li>
              <strong className="text-slate-200">Android 17 Local Network Protection:</strong> Target SDK 37 enforces <code>android.permission.ACCESS_LOCAL_NETWORK</code>. Apps attempting raw socket connections to private ranges without user consent are blocked by the OS sandbox.
            </li>
          </ul>
        </div>
      </div>

      {/* Android 17 Permission Simulator & Status */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-xs font-bold text-white">
              Android 17 Local Network Permission (ACCESS_LOCAL_NETWORK)
            </div>
            <div className="text-[11px] text-slate-400">
              {settings.localNetworkPermissionGranted
                ? 'Granted in runtime manifest context.'
                : 'Blocked: Simulates user denying local Wi-Fi scan.'}
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            onUpdateSettings({
              localNetworkPermissionGranted: !settings.localNetworkPermissionGranted,
            })
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            settings.localNetworkPermissionGranted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
          }`}
        >
          {settings.localNetworkPermissionGranted ? 'Granted (Toggle)' : 'Denied (Toggle)'}
        </button>
      </div>

      {/* Diagnostic Results Report */}
      {report && (
        <div className="space-y-4">
          {/* Verdict Banner */}
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between ${
              report.overallStatus === 'passed'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                : report.overallStatus === 'warning'
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-400'
            }`}
          >
            <div className="flex items-center space-x-3">
              {report.overallStatus === 'passed' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : report.overallStatus === 'warning' ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
              <div>
                <h4 className="font-bold text-base uppercase tracking-wider">
                  Diagnostic Verdict: {report.overallStatus}
                </h4>
                <p className="text-xs opacity-90">
                  Target: {report.targetUrl} • Topology: {report.hostType}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {new Date(report.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* 10-Point Checklist */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-200">
              10-Point Verification Results:
            </h3>

            <div className="space-y-2">
              {report.checks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between text-xs gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      {chk.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : chk.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{chk.title}</span>
                    </div>
                    <p className="text-slate-400 pl-6">{chk.details}</p>
                  </div>

                  {chk.latencyMs != null && (
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded shrink-0">
                      {chk.latencyMs}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="p-5 rounded-2xl bg-[#0b0f19] border border-cyan-500/30 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
              Diagnostic Recommendations & Fixes:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

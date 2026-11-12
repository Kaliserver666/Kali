import React, { useState } from 'react';
import {
  FolderArchive,
  Download,
  FileCode,
  Copy,
  Check,
  Folder,
  Terminal,
  Shield,
  Smartphone,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, ProjectFileItem } from '../androidProject/projectFiles';
import { ZipExporter } from '../androidProject/zipExporter';

export const AndroidProjectScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFileItem>(ANDROID_PROJECT_FILES[3]); // Default to AndroidManifest.xml
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isExportingJava, setIsExportingJava] = useState(false);
  const [javaExportSuccess, setJavaExportSuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const blob = await ZipExporter.exportProjectZip();
      ZipExporter.triggerDownload(blob, 'vladimir-ai-android-project.zip');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (e) {
      console.error('ZIP generation failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJavaZip = async () => {
    setIsExportingJava(true);
    try {
      const { JavaZipExporter } = await import('../androidProject/javaZipExporter');
      const blob = await JavaZipExporter.exportJavaProjectZip();
      JavaZipExporter.triggerDownload(blob, 'vladimir-ai-aide-java-project.zip');
      setJavaExportSuccess(true);
      setTimeout(() => setJavaExportSuccess(false), 4000);
    } catch (e) {
      console.error('Java ZIP generation failed:', e);
    } finally {
      setIsExportingJava(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#110f24] via-[#0d1222] to-[#070b14] border border-purple-500/40 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>AIDE PRO COMPATIBLE (PURE JAVA + XML) & ANDROID STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Native Android Source & 1-Click ZIP Exporter
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Download the <strong>Pure Java + XML project (.ZIP)</strong> designed specifically for building inside <strong>AIDE Pro</strong> on your phone, or the Kotlin/Compose version for Android Studio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={handleDownloadJavaZip}
            disabled={isExportingJava}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs hover:scale-[1.02] shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isExportingJava ? 'animate-bounce' : ''}`} />
            <span>{isExportingJava ? 'Packaging AIDE Java ZIP...' : '🚀 Download AIDE Pro (Java) .ZIP'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs hover:scale-[1.02] shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Packaging Compose ZIP...' : '📱 Download Android Studio .ZIP'}</span>
          </button>
        </div>
      </div>

      {javaExportSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong>Download Started: <code>vladimir-ai-aide-java-project.zip</code></strong>
            <p className="font-normal opacity-90 mt-0.5">
              Pure Java (.java) + XML layout structure. Fully supported by AIDE Pro for building and compiling directly on your Android phone!
            </p>
          </div>
        </div>
      )}

      {exportSuccess && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
          <div>
            <strong>Download Started: <code>vladimir-ai-android-project.zip</code></strong>
            <p className="font-normal opacity-90 mt-0.5">
              Contains Kotlin & Jetpack Compose sources for Android Studio.
            </p>
          </div>
        </div>
      )}

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Tree Sidebar */}
        <div className="lg:col-span-4 bg-[#090d16] border border-slate-800 rounded-2xl p-4 space-y-3 h-[550px] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-cyan-400" />
              Project Structure
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {ANDROID_PROJECT_FILES.length} Files
            </span>
          </div>

          <div className="space-y-1">
            {ANDROID_PROJECT_FILES.map((f) => {
              const isSelected = selectedFile.path === f.path;
              const isKotlin = f.category === 'kotlin';
              const isManifest = f.category === 'manifest';
              const isGradle = f.category === 'gradle';

              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isKotlin
                          ? 'text-purple-400'
                          : isManifest
                          ? 'text-amber-400'
                          : isGradle
                          ? 'text-cyan-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{f.path.split('/').pop()}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">
                    {f.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-8 bg-[#090d16] border border-slate-800 rounded-2xl flex flex-col h-[550px] overflow-hidden">
          {/* File Header */}
          <div className="px-4 py-3 bg-[#0d121e] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-cyan-300 font-semibold truncate max-w-sm">
                {selectedFile.path}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-sans">
                {selectedFile.category}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>
          </div>

          {/* Source Code Content */}
          <div className="flex-1 overflow-auto p-4 bg-[#05070c] scrollbar-thin">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre font-normal">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>

      {/* Setup Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Android Studio Build Workflow
          </h3>
          <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1 leading-relaxed">
            <li>Download and unzip <code>vladimir-ai-android-project.zip</code>.</li>
            <li>In Android Studio, click <strong>File &gt; Open</strong> and choose the folder.</li>
            <li>Gradle sync will automatically configure dependencies (Material 3, OkHttp, Coroutines, Room).</li>
            <li>Connect your device via USB (Developer Options enabled) and hit <strong>Run 'app'</strong>.</li>
          </ol>
        </div>

        <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            AIDE Pro Compatibility Notice
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vladimir AI is designed with standard Kotlin 1.9+ and Jetpack Compose BOM 2024.11. Older AIDE Pro mobile versions that do not yet include Compose bytecode compilers can build the project by pairing with Termux Gradle or compiling directly on Android Studio.
          </p>
        </div>
      </div>
    </div>
  );
};

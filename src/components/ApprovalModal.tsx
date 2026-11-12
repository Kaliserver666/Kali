import React from 'react';
import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  toolName: string;
  args: Record<string, any>;
  explanation: string;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  toolName,
  args,
  explanation,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0e1320] border-2 border-amber-500/40 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Agent Security Approval Required
            </h3>
            <p className="text-xs text-amber-400 font-medium">
              Sensitive Operation Execution
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300">
            Vladimir AI has requested to execute the following sensitive tool:
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                tool: {toolName}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                SAF / Storage Mutation
              </span>
            </div>
            <p className="text-xs text-slate-400">{explanation}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1.5">
              Operation Arguments:
            </span>
            <pre className="p-3 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-48 scrollbar-thin">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
            🛡️ <strong>Safety Guarantee:</strong> Operations are isolated. Approving allows Vladimir AI to continue its task plan. Rejecting will signal the AI to skip this mutation.
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onReject}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>Deny & Cancel</span>
          </button>
          <button
            onClick={onApprove}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all font-bold"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approve & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};

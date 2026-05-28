/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog, UserRole } from '../types';
import { ShieldAlert, Terminal, Calendar, User, Search, RefreshCw, Layers } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export default function AuditLogsView({ logs, onRefresh }: AuditLogsViewProps) {
  const [query, setQuery] = useState('');

  const filtered = logs.filter(l => {
    const q = query.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.newValue && l.newValue.toLowerCase().includes(q)) ||
      (l.previousValue && l.previousValue.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            System Security Logs & Audit Trail
          </h2>
          <p className="text-xs text-[#717684]">Chronological immutable logs detailing user actions, previous state values, and JWT validations.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-audit-logs-btn"
            onClick={onRefresh}
            className="p-2 bg-[#1C1F26] border border-[#2D313C] hover:bg-[#2D313C] rounded-lg text-[#00D1FF] transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Logs
          </button>
        </div>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl flex items-center gap-3">
        <span className="text-[#525866]">
          <Search className="w-4 h-4" />
        </span>
        <input
          id="audit-log-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter logs by operator name, Action keyword, previous parameters..."
          className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-1.5 px-3 text-xs text-stone-200 placeholder-[#525866] focus:outline-none focus:border-[#00D1FF]"
        />
      </div>

      {/* CHRONOLOGICAL TIMELINE LIST */}
      <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden flex flex-col">
        <div className="bg-[#1C1F26] px-6 py-4 border-b border-[#1F222B] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[#717684] font-mono flex items-center gap-1">
            <Terminal className="w-4 h-4 text-[#00D1FF]" />
            Plant Blockchain Audit Stream
          </span>
          <span className="text-[10px] bg-red-400/10 text-red-400 border border-red-500/15 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            🔒 Tamper Checked Safe
          </span>
        </div>

        <div className="divide-y divide-[#1F222B] max-h-[580px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#717684]">
              No system action logs matched your filter inputs.
            </div>
          ) : (
            filtered.map((log) => {
              const getBadgeColor = (role: UserRole) => {
                switch(role) {
                  case UserRole.ADMIN: return 'border-red-500/25 text-red-400 bg-red-500/5';
                  case UserRole.MATERIAL_TEAM: return 'border-blue-500/25 text-blue-400 bg-blue-500/5';
                  case UserRole.QUALITY_TEAM: return 'border-[#00D1FF]/20 text-[#00D1FF] bg-[#00D1FF]/5';
                  case UserRole.DTG_TEAM: return 'border-pink-500/20 text-pink-300 bg-pink-500/5';
                  default: return 'border-stone-500/20 text-stone-400 bg-stone-500/5';
                }
              };

              return (
                <div key={log.id} className="p-4.5 hover:bg-[#161920]/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs">
                  <div className="space-y-1.5 flex-1 max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-[#0A0B0E] border border-[#1F222B] text-amber-500 rounded px-1.5 py-0.5">
                        Log #{log.id.slice(-6)}
                      </span>
                      <span className="font-bold text-white tracking-tight">{log.action}</span>
                    </div>

                    {log.previousValue && (
                      <p className="text-[#717684] truncate">
                        Previous state details: <span className="text-stone-400 bg-[#0A0B0E] py-0.5 px-1.5 rounded font-mono text-[11px] border border-[#1F222B]/40">{log.previousValue}</span>
                      </p>
                    )}

                    {log.newValue && (
                      <p className="text-stone-300 truncate font-semibold">
                        Committed state changes: <span className="text-[#00D1FF] bg-[#0A0B0E] py-0.5 px-1.5 rounded font-mono text-[11px] border border-[#1F222B]/40">{log.newValue}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-[#525866] font-medium font-mono">
                      <span className="flex items-center gap-1.5 text-stone-400">
                        <User className="w-3.5 h-3.5 text-[#515764]" />
                        {log.userName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${getBadgeColor(log.userRole)}`}>
                        {log.userRole.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-[#717684] font-mono text-[10px] font-semibold flex items-center justify-end gap-1.5">
                    <Calendar className="w-4 h-4 text-[#525866]" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

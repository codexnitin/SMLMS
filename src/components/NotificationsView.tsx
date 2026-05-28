/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Notification } from '../types';
import { Bell, ShieldAlert, CheckCircle, AlertTriangle, Info, Check } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationsView({ notifications, onMarkAllRead, onClose }: NotificationsViewProps) {
  return (
    <div 
      id="notifications-modal"
      className="fixed inset-0 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div className="bg-[#111318] border border-[#1F222B] w-full max-w-xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="bg-[#0F1116] border-b border-[#1F222B] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#00D1FF]/10 text-[#00D1FF] rounded-lg">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">BHEL Broadcast Depot</h3>
              <p className="text-xs text-[#717684]">Enterprise live notifications & smart department alerts</p>
            </div>
          </div>
          <button 
            id="close-notifications-btn"
            onClick={onClose}
            className="text-[#717684] hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#717684]">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Inbox cleared. No warnings or status updates flagged.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const getIcon = () => {
                switch(n.type) {
                  case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-400" />;
                  case 'ERROR': return <ShieldAlert className="w-5 h-5 text-red-400" />;
                  case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
                  default: return <Info className="w-5 h-5 text-[#00D1FF]" />;
                }
              };

              const getBg = () => {
                switch(n.type) {
                  case 'SUCCESS': return 'border-l-4 border-l-green-500 bg-green-500/5';
                  case 'ERROR': return 'border-l-4 border-l-red-500 bg-red-400/5';
                  case 'WARNING': return 'border-l-4 border-l-yellow-500 bg-yellow-500/5';
                  default: return 'border-l-4 border-l-[#00D1FF] bg-[#00D1FF]/5';
                }
              };

              return (
                <div 
                  id={`notification-card-${n.id}`}
                  key={n.id} 
                  className={`p-4 rounded-lg border border-[#1F222B] transition-all flex gap-3.5 ${getBg()} ${!n.isRead ? 'shadow-[0_0_12px_rgba(0,209,255,0.05)]' : 'opacity-80'}`}
                >
                  <div className="mt-0.5">{getIcon()}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#E0E0E0]">{n.title}</span>
                      <span className="text-[10px] font-mono text-[#717684]">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#717684] leading-relaxed">{n.message}</p>
                    {n.roleScope && (
                      <span className="inline-block mt-2 text-[9px] font-mono font-bold bg-[#1C1F26] text-[#00D1FF] border border-[#00D1FF]/20 px-2 py-0.5 rounded uppercase">
                        Role: {n.roleScope.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-[#0F1116] border-t border-[#1F222B] px-6 py-4 flex items-center justify-between">
          <button 
            id="mark-all-read-btn"
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-[#00D1FF] hover:text-[#00B8E0] font-semibold transition-colors disabled:opacity-50"
            disabled={notifications.every(n => n.isRead)}
          >
            <Check className="w-4 h-4" /> Clear All Inbox Messages
          </button>
          <button 
            id="dismiss-notif-btn"
            onClick={onClose}
            className="bg-[#1C1F26] border border-[#2D313C] px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2D313C] text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

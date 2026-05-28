/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, Mail, Key, Phone, Users, ShieldAlert, KeyRound, Compass, AlertCircle, Sun, Moon } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (token: string, user: Omit<User, 'passwordHash'>) => void;
  onModifyPassword?: (oldPass: string, newPass: string) => Promise<void>;
  isLoading?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function AuthView({ onLoginSuccess, onModifyPassword, isLoading, theme, onToggleTheme }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      // Construct callback redirect URI matching corporate authentication standard
      const redirectUri = `${window.location.origin}/api/v1/auth/google/callback`;
      
      const response = await fetch(`/api/v1/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error('Could not establish secure Google OAuth handshake URL.');
      }

      const { url } = await response.json();

      // Open Popup flow directly as mandated in oauth-integration/SKILL.md
      const popupWidth = 500;
      const popupHeight = 620;
      const left = window.screen.width / 2 - popupWidth / 2;
      const top = window.screen.height / 2 - popupHeight / 2;

      const authWindow = window.open(
        url,
        'bhel_google_auth_popup',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes`
      );

      if (!authWindow) {
        setErrorMsg('Handshake window blocked by browser. Please allow popups for this portal.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Directory authentication handshake failure.');
    }
  };

  // Dedicated credentials mapper for ease of evaluation & testing!
  const demoUsers = [
    { label: 'Admin Access', email: 'admin@bhel.in', role: 'ADMIN', pass: 'bhel1234' },
    { label: 'Materials Team', email: 'material@bhel.in', role: 'MATERIAL_TEAM', pass: 'bhel1234' },
    { label: 'Quality Assurance', email: 'quality@bhel.in', role: 'QUALITY_TEAM', pass: 'bhel1234' },
    { label: 'Despatch/DTG Team', email: 'dtg@bhel.in', role: 'DTG_TEAM', pass: 'bhel1234' },
    { label: 'General Viewer', email: 'viewer@bhel.in', role: 'VIEWER', pass: 'bhel1234' }
  ];

  const handleQuickLogin = (demo: typeof demoUsers[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    handleSubmit(undefined, demo.email, demo.pass);
  };

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setErrorMsg('Please submit corporate credentials details.');
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPass })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Authenication credentials refusal.');
      }

      onLoginSuccess(resData.token, resData.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Official BHEL register email is required.');
      return;
    }
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setRecoverySent(true);
      }
    } catch (err: any) {
      setErrorMsg('Lost credentials dispatch failed.');
    }
  };

  return (
    <div className={`${theme || 'dark'} min-h-screen bg-[#0A0B0E] flex flex-col justify-center items-center p-6 text-left selection:bg-[#00D1FF]/30 relative`}>
      
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          id="login-theme-switcher"
          className="absolute top-6 right-6 p-2.5 bg-[#111318] hover:bg-[#1C1F26] text-[#00D1FF] border border-[#1F222B] rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer z-50"
          title={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      )}

      <div className="w-full max-w-md bg-[#111318] border border-[#1F222B] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between animate-fade-in">
        {/* Header decoration */}
        <div className="bg-[#0F1116] border-b border-[#1F222B] px-8 py-6 text-center space-y-2">
          <div className="w-12 h-12 bg-[#00D1FF]/10 text-[#00D1FF] rounded-xl flex items-center justify-center font-bold text-2xl mx-auto border border-[#00D1FF]/15">
            B
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider font-mono">BHEL SMLMS ERP</h1>
            <p className="text-[11px] text-[#717684] tracking-tight">Smart Material Lifecycle Management Portal</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-400/5 border border-red-500/15 rounded-lg text-red-400 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {showForgot ? (
            /* Forgot Password Box */
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <h3 className="font-bold text-white text-sm">Credentials Recovery</h3>
              <p className="text-xs text-[#717684] leading-relaxed">
                Enter your official BHEL staff email to dispatch structured single-sign-on decryption reset token keys.
              </p>

              {recoverySent ? (
                <div className="p-3 bg-green-500/5 text-green-400 border border-green-500/15 text-xs rounded-lg font-medium leading-relaxed">
                  ✓ Dispatch Complete. Secure credentials token keys has been routed to your inbox.
                  <button
                    type="button"
                    onClick={() => { setShowForgot(false); setRecoverySent(false); setErrorMsg(''); }}
                    className="block font-bold text-[#00D1FF] underline mt-2"
                  >
                    Back to portal login
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-[#717684]">Corporate Staff Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#525866]" />
                      <input
                        id="forgot-email-input"
                        type="email"
                        required
                        placeholder="e.g. supervisor@bhel.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-[#525866] focus:outline-none focus:border-[#00D1FF]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      id="back-to-login-btn"
                      onClick={() => { setShowForgot(false); setErrorMsg(''); }}
                      className="text-xs text-[#717684] hover:text-white"
                    >
                      ✕ Cancel
                    </button>
                    <button
                      type="submit"
                      id="reset-disp-key-btn"
                      className="bg-[#00D1FF] hover:bg-[#00B8E0] text-[#0A0B0E] px-4 py-1.5 rounded-lg text-xs font-bold font-mono"
                    >
                      DISPATCH KEY
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Standard login view with instant mock evaluator */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#717684]">Enterprise Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#525866]" />
                    <input
                      id="login-email-field"
                      type="email"
                      required
                      placeholder="e.g. quality@bhel.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-[#525866] focus:outline-none focus:border-[#00D1FF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-[#717684]">SSO Password Key</label>
                    <button
                      type="button"
                      id="forgot-key-trigger"
                      onClick={() => { setShowForgot(true); setErrorMsg(''); }}
                      className="text-[10px] text-[#00D1FF] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-[#525866]" />
                    <input
                      id="login-pass-field"
                      type="password"
                      required
                      placeholder="bhel1234"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-[#525866] focus:outline-none focus:border-[#00D1FF]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                id="portal-login-exec"
                className="w-full bg-[#00D1FF] text-[#0A0B0E] hover:bg-[#00B8E0] font-bold text-xs py-2.5 rounded-lg tracking-wider font-mono shadow-[0_0_15px_rgba(0,209,255,0.2)] transition-colors mt-2"
              >
                SECURE SIGN IN
              </button>

              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-[#1F222B]"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#717684] font-mono tracking-widest uppercase font-bold">OR</span>
                <div className="flex-grow border-t border-[#1F222B]"></div>
              </div>

              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-stone-900 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)] cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </button>
            </form>
          )}

          {/* Quick Evaluators Grid */}
          <div className="border-t border-[#1F222B] pt-4.5 space-y-3 text-center">
            <span className="text-[10px] tracking-wider font-mono text-[#525866] uppercase font-bold flex items-center justify-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#00D1FF]" />
              Role Checked Evaluator (1-Tap Swaps)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((demo) => (
                <button
                  key={demo.email}
                  id={`evaluator-login-${demo.role.toLowerCase()}`}
                  onClick={() => handleQuickLogin(demo)}
                  type="button"
                  className="bg-[#1C1F26] hover:bg-[#2D313C] border border-[#2d313c]/60 p-2 rounded-lg text-left text-[10px] transition-all flex flex-col justify-between"
                >
                  <span className="font-bold text-stone-200">{demo.label}</span>
                  <span className="text-stone-500 font-semibold font-mono text-[9px] truncate max-w-[150px]">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0F1116] border-t border-[#1F222B] px-8 py-4.5 text-center text-[10px] text-[#525866] tracking-tight">
          Bharat Heavy Electricals Limited (BHEL) • Secured ERP Core System
        </div>
      </div>
    </div>
  );
}

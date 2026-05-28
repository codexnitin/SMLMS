/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Material } from '../types';
import { QrCode, Scan, Camera, Search, HelpCircle, ShieldAlert } from 'lucide-react';
import QRVector from './QRVector';

interface QRScannerViewProps {
  materials: Material[];
  onSelectMaterial: (m: Material) => void;
}

export default function QRScannerView({ materials, onSelectMaterial }: QRScannerViewProps) {
  const [typedId, setTypedId] = useState('');
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'matched' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setScannerStatus('scanning');

    setTimeout(() => {
      const match = materials.find(m => m.id.toLowerCase() === typedId.trim().toLowerCase());
      if (match) {
        setScannerStatus('matched');
        onSelectMaterial(match);
      } else {
        setScannerStatus('failed');
        setErrorMessage(`Discrepancy: Material ID "${typedId}" not registered inside BHEL SMLMS directory.`);
      }
    }, 1200);
  };

  const handleQuickMatch = (mId: string) => {
    setTypedId(mId);
    setScannerStatus('scanning');
    setTimeout(() => {
      const match = materials.find(m => m.id === mId);
      if (match) {
        setScannerStatus('matched');
        onSelectMaterial(match);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          QR Code Decryption Terminal
        </h2>
        <p className="text-xs text-[#717684]">Decode high-resolution matrix QR labels attached to raw material loads. Simulates physical laser scanning gun controllers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PHYSICAL SIMULATOR DISPLAY */}
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-6 flex flex-col justify-between items-center text-center space-y-6 min-h-[380px]">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#717684] font-mono flex items-center gap-1">
              <Scan className="w-4 h-4 text-[#00D1FF]" />
              OPTIC LASER SIMULATION
            </h3>
            <p className="text-[11px] text-[#717684]">Laser tracker coordinates scanning feed calibration.</p>
          </div>

          {/* Dynamic Laser Screen */}
          <div className="relative w-60 h-60 bg-[#0F1116] border border-stone-850 rounded-xl overflow-hidden flex flex-col items-center justify-center p-3">
            {/* Laser Scanning line animation */}
            {scannerStatus === 'scanning' && (
              <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce z-10"></div>
            )}

            {scannerStatus === 'scanning' ? (
              <div className="text-center space-y-2 animate-pulse">
                <Camera className="w-8 h-8 text-[#00D1FF] mx-auto animate-spin" />
                <p className="text-xs font-mono font-bold text-[#00D1FF]">Aligning coordinates...</p>
              </div>
            ) : scannerStatus === 'matched' ? (
              <div className="text-center space-y-1 animate-pulse">
                <div className="w-12 h-12 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  ✓
                </div>
                <p className="text-xs font-mono font-bold text-green-400">Match Locked!</p>
              </div>
            ) : (
              <div className="space-y-3 opacity-80">
                <QrCode className="w-14 h-14 text-stone-600 mx-auto" />
                <p className="text-[10px] text-[#717684] font-semibold leading-relaxed">
                  Position Barcode or QR label within camera bounds to decode.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-[#717684] font-mono select-none">
            Calibration status: <strong className="text-green-500 uppercase">ONLINE</strong>
          </div>
        </div>

        {/* INPUT DECODER / FALLBACK */}
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Material ID Lookup Decrypter
            </h4>
            <p className="text-xs text-[#717684]">
              Encountering laser alignment issues? Key in the unique hexadecimal raw material key manually.
            </p>
          </div>

          <form onSubmit={handleSimulateScan} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-500 text-xs rounded-lg font-semibold flex items-start gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-[#717684]">Raw Material Key ID code *</label>
              <div className="flex gap-2">
                <input
                  id="typed-id-ref"
                  type="text"
                  required
                  placeholder="e.g. BHEL-M-1192"
                  value={typedId}
                  onChange={(e) => setTypedId(e.target.value)}
                  className="flex-1 bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
                <button
                  type="submit"
                  disabled={scannerStatus === 'scanning'}
                  className="bg-[#00D1FF] text-[#0A0B0E] font-bold text-xs px-4 rounded-lg hover:bg-[#00B8E0] transition-colors disabled:opacity-40"
                >
                  DECODE KEY
                </button>
              </div>
            </div>
          </form>

          {/* Quick-links of available IDs for rapid evaluation */}
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase text-[#717684] tracking-widest font-mono">Quick scan simulation keys</h5>
            <div className="flex flex-wrap gap-2.5">
              {materials.slice(0, 4).map(m => (
                <button
                  key={m.id}
                  id={`quick-scan-${m.id}`}
                  onClick={() => handleQuickMatch(m.id)}
                  className="text-[10px] font-mono font-bold bg-[#1C1F26] hover:bg-[#2D313C] text-[#00D1FF] border border-[#2D313C] px-2.5 py-1 rounded transition-colors"
                >
                  [⚡ {m.id}]
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

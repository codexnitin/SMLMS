/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Material, MaterialStatus } from '../types';
import { Download, FileSpreadsheet, FileClock, Printer, Calendar, ShieldCheck, Compass, Sliders } from 'lucide-react';

interface ReportsViewProps {
  materials: Material[];
}

export default function ReportsView({ materials }: ReportsViewProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Multi-department filters
  const filtered = materials.filter(m => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesVendor = !vendorFilter.trim() || m.vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(m.arrivalDate).getTime() >= new Date(dateFrom).getTime();
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(m.arrivalDate).getTime() <= new Date(dateTo).getTime();
    }
    return matchesStatus && matchesVendor && matchesDate;
  });

  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const triggerDownload = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      
      // Simulate enterprise level file compilation downloads
      const fileData = JSON.stringify(filtered, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SMLMS_BHEL_Report_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-xl font-bold text-white">Central Operations Audit & KPI Reports</h2>
        <p className="text-xs text-[#717684]">Generate validated ISO 9001 quality certificates lists, incoming ledger reports, and stock balances sheet.</p>
      </div>

      {/* FILTERS TOOLBOX */}
      <div className="bg-[#111318] border border-[#1F222B] p-5 rounded-xl space-y-4">
        <h3 className="text-xs font-bold uppercase text-stone-300 font-mono tracking-widest flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00D1FF]" />
          Custom Query Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[#717684]">Arrived From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#525866]" />
              <input 
                id="report-from-date"
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[#717684]">Arrived To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#525866]" />
              <input 
                id="report-to-date"
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[#717684]">Vendor Account name</label>
            <input 
              id="report-vendor-input"
              type="text" 
              placeholder="e.g. Bharat Copper"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[#717684]">Lifecycle Scope</label>
            <select
              id="report-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="ALL">All Lifecycle Codes</option>
              <option value="PENDING">Pending Acceptance</option>
              <option value="ACCEPTED">Gate Accepted (Lab)</option>
              <option value="REJECTED">Gate Rejected (Closed)</option>
              <option value="QUALITY_PASSED">QA Passed</option>
              <option value="QUALITY_FAILED">QA Failed</option>
              <option value="IN_STOCK">Stockyard Allocation</option>
              <option value="DISPATCHED">Issued for Heavy Machinery</option>
            </select>
          </div>
        </div>
      </div>

      {/* GENERATION SUITE MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111318] border border-[#1F222B] p-5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Download className="w-5 h-5 text-red-400" />
              PDF Compliance Reports
            </h4>
            <p className="text-[11px] text-[#717684]">
              Validated vector layout document including QA checklists, laboratory certificates signatures and official ISO stamps.
            </p>
          </div>
          <button
            id="download-pdf-report"
            onClick={() => triggerDownload('PDF')}
            disabled={downloadingFormat !== null}
            className="w-full bg-[#1C1F26] hover:bg-red-500/10 text-xs font-bold text-stone-300 py-2 rounded-lg border border-red-500/20 text-center transition-all disabled:opacity-50"
          >
            {downloadingFormat === 'PDF' ? 'Compiling PDF File...' : 'DOWNLOAD SECURE PDF'}
          </button>
        </div>

        <div className="bg-[#111318] border border-[#1F222B] p-5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
              Excel Data Sheets (XLS)
            </h4>
            <p className="text-[11px] text-[#717684]">
              Contains full transactional records, arriving vehicles weight registers, PO codes logs, and warehouse coordinates matrices.
            </p>
          </div>
          <button
            id="download-excel-report"
            onClick={() => triggerDownload('EXCEL')}
            disabled={downloadingFormat !== null}
            className="w-full bg-[#1C1F26] hover:bg-green-500/10 text-xs font-bold text-stone-300 py-2 rounded-lg border border-green-500/20 text-center transition-all disabled:opacity-50"
          >
            {downloadingFormat === 'EXCEL' ? 'Formulating Sheets...' : 'DOWNLOAD EXCEL DATA'}
          </button>
        </div>

        <div className="bg-[#111318] border border-[#1F222B] p-5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Printer className="w-5 h-5 text-indigo-400" />
              Direct Print Manifests
            </h4>
            <p className="text-[11px] text-[#717684]">
              Optimized grid style tables with structural margins suitable for physical clipboards, audits, and physical plant filings.
            </p>
          </div>
          <button
            id="print-manifest-report"
            onClick={() => window.print()}
            className="w-full bg-[#1C1F26] hover:bg-indigo-500/10 text-xs font-bold text-stone-300 py-2 rounded-lg border border-indigo-500/20 text-center transition-all"
          >
            PRINT PREVIEW CURRENT LIST
          </button>
        </div>
      </div>

      {/* FILTERED PREVIEW TABLE */}
      <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden">
        <div className="bg-[#1C1F26] px-6 py-4 border-b border-[#1F222B] flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-stone-300 font-mono">Ledger Database Query matches ({filtered.length})</span>
          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> ISO 9001 Compliant Audit Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F1116] text-[#717684] uppercase font-bold border-b border-[#1F222B]">
              <tr>
                <th className="px-6 py-3">Material ID</th>
                <th className="px-6 py-3">Component Class</th>
                <th className="px-6 py-3">Vendor / PO</th>
                <th className="px-6 py-3">Vol Qty</th>
                <th className="px-6 py-3">Arrival Date</th>
                <th className="px-6 py-3 inline-block">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F222B]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#717684]">
                    No ledger records match the queried date ranges or status properties.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-[#161920]/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-white font-bold">{m.id}</td>
                    <td className="px-6 py-3.5 text-stone-300 font-semibold truncate max-w-[150px]">{m.name}</td>
                    <td className="px-6 py-3.5 text-[#717684]">
                      <p className="font-bold text-stone-350">{m.vendorName}</p>
                      <p className="text-[9px] font-mono">{m.purchaseOrderNumber}</p>
                    </td>
                    <td className="px-6 py-3.5 text-[#00D1FF] font-semibold font-mono">{m.quantity} {m.unit}</td>
                    <td className="px-6 py-3.5 text-[#717684]">{new Date(m.arrivalDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-[9px] font-mono font-bold bg-[#1C1F26] text-white px-2 py-0.5 rounded uppercase max-w-[124px] truncate border border-[#1F222B] block text-center">
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

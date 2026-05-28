/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Material, QualityInspection, MaterialStatus, UserRole } from '../types';
import { FileCheck, ShieldAlert, CheckCircle, HelpCircle, FileText, ChevronRight, ClipboardList, PenTool, Flame } from 'lucide-react';

interface QualityViewProps {
  materials: Material[];
  inspections: QualityInspection[];
  currentUserRole: UserRole;
  currentUserName: string;
  onSubmitInspection: (
    materialId: string, 
    result: 'PASS' | 'FAIL', 
    remarks: string, 
    checklist: QualityInspection['checklist'],
    defectCategory?: string
  ) => void;
}

export default function QualityView({
  materials,
  inspections,
  currentUserRole,
  currentUserName,
  onSubmitInspection
}: QualityViewProps) {
  // Pending queue of accepted materials waiting for QA checks
  const pendingQA = materials.filter(m => m.status === MaterialStatus.ACCEPTED);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Inspection Checklist form
  const [result, setResult] = useState<'PASS' | 'FAIL'>('PASS');
  const [remarks, setRemarks] = useState('');
  const [defectCategory, setDefectCategory] = useState('');
  const [checklist, setChecklist] = useState({
    dimensionsOk: true,
    tensileStrengthOk: true,
    materialGradeOk: true,
    surfaceFinishOk: true,
    chemicalCompositionOk: true
  });

  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  const handleCheckboxChange = (field: keyof typeof checklist) => {
    setChecklist(prev => {
      const updated = { ...prev, [field]: !prev[field] };
      // Auto-switch result mode based on checks (if any check is false, recommend FAIL!)
      const allPassed = Object.values(updated).every(val => val === true);
      setResult(allPassed ? 'PASS' : 'FAIL');
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    if (!remarks.trim()) {
      alert("Please enter analytical remarks summarizing structural and metallurgy observations.");
      return;
    }

    onSubmitInspection(
      selectedMaterial.id,
      result,
      remarks,
      checklist,
      result === 'FAIL' ? (defectCategory || 'Standard checklist failures') : undefined
    );

    // Reset UI
    setSelectedMaterial(null);
    setRemarks('');
    setDefectCategory('');
    setChecklist({
      dimensionsOk: true,
      tensileStrengthOk: true,
      materialGradeOk: true,
      surfaceFinishOk: true,
      chemicalCompositionOk: true
    });
    setResult('PASS');
  };

  const isInspector = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.QUALITY_TEAM;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Quality Assurance & Metallurgical Bureau
          </h2>
          <p className="text-xs text-[#717684]">Inspect raw materials and issue structural PASS/FAIL laboratory certificates.</p>
        </div>

        <div className="flex bg-[#111318] p-1 rounded-lg border border-[#1F222B]">
          <button
            onClick={() => { setActiveTab('queue'); setSelectedMaterial(null); }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'queue' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
          >
            Quarantine Queue ({pendingQA.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'history' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
          >
            Inspection History ({inspections.length})
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Pending Quarantine */}
          <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-5 lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-[#1F222B] pb-3">
              <ClipboardList className="w-4 h-4 text-[#00D1FF]" />
              Awaiting Inspection List
            </h3>

            {pendingQA.length === 0 ? (
              <div className="text-center py-12 text-[#717684] space-y-2">
                <CheckCircle className="w-10 h-10 mx-auto text-green-400 opacity-45" />
                <p className="text-xs font-semibold">Quarantine clear.</p>
                <p className="text-[10px] text-[#525866]">All gate arrivals processed and cleared.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {pendingQA.map((m) => (
                  <div
                    id={`qa-item-${m.id}`}
                    key={m.id}
                    onClick={() => {
                      if (!isInspector) {
                        alert("Access restricted. Sign in with standard Quality Team or Admin credentials.");
                        return;
                      }
                      setSelectedMaterial(m);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      selectedMaterial?.id === m.id
                        ? 'bg-[#1C1F26] border-[#00D1FF]/60 shadow-[0_0_12px_rgba(0,209,255,0.06)]'
                        : 'bg-[#161920]/40 border-[#1F222B] hover:border-[#717684]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-[#00D1FF]">{m.id}</span>
                      <span className="text-[9px] font-bold font-mono text-stone-300">
                        {m.quantity} {m.unit}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-[#717684] truncate">Vendor: {m.vendorName}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] text-[#525866] border-t border-[#1F222B] pt-2">
                      <span>Arrived: {new Date(m.arrivalDate).toLocaleDateString()}</span>
                      <span className="text-[#00D1FF] font-semibold flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form / Guidance Dashboard */}
          <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-6 lg:col-span-2">
            {!selectedMaterial ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-[#717684]">
                <FileCheck className="w-14 h-14 text-[#00D1FF] opacity-35 mb-4" />
                <h4 className="font-bold text-white text-sm">QA Execution Slate</h4>
                <p className="text-xs text-[#717684] max-w-sm mt-1.5 leading-relaxed">
                  Select an items batch from the quarantine queue sidebar to start material verification, tensile checks, surface examinations, and checklist filing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-[#1F222B] pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20 px-2 py-0.5 rounded uppercase">
                      Active Evaluation File
                    </span>
                    <h3 className="font-bold text-base text-white mt-1.5">
                      {selectedMaterial.name}
                    </h3>
                    <p className="text-xs text-[#717684] font-mono mt-0.5">
                      PO ID: {selectedMaterial.purchaseOrderNumber} | Invoice: {selectedMaterial.invoiceNumber} | Vendor: {selectedMaterial.vendorName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial(null)}
                    className="text-stone-400 hover:text-white text-xs border border-[#1F222B] bg-[#1C1F26] px-2 py-1 rounded"
                  >
                    Reset
                  </button>
                </div>

                {/* Checklist properties */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wide flex items-center gap-1">
                    <ClipboardList className="w-4 h-4 text-[#00D1FF]" />
                    Raw Material QA Checklist Requirements
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#0F1116] p-4 rounded-xl border border-[#1F222B]">
                    {/* Dimension verify */}
                    <label 
                      id="lbl-dimensions"
                      className="flex items-center justify-between p-3.5 bg-[#111318] border border-[#1f222b] rounded-lg cursor-pointer hover:border-[#00D1FF]/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white block">Dimensional Coordinates</span>
                        <span className="text-[10px] text-[#717684] block">Check thickness, tolerances, length</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checklist.dimensionsOk}
                        onChange={() => handleCheckboxChange('dimensionsOk')}
                        className="w-4 h-4 rounded text-[#00D1FF] bg-[#1C1F26] border-[#2D313C] focus:ring-[#00D1FF]"
                      />
                    </label>

                    {/* Tensile verify */}
                    <label 
                      id="lbl-tensile"
                      className="flex items-center justify-between p-3.5 bg-[#111318] border border-[#1f222b] rounded-lg cursor-pointer hover:border-[#00D1FF]/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white block">Tensile & Burst Strength</span>
                        <span className="text-[10px] text-[#717684] block">Verify yield limits matches ASTM</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checklist.tensileStrengthOk}
                        onChange={() => handleCheckboxChange('tensileStrengthOk')}
                        className="w-4 h-4 rounded text-[#00D1FF] bg-[#1C1F26] border-[#2D313C] focus:ring-[#00D1FF]"
                      />
                    </label>

                    {/* Grade compatibility */}
                    <label 
                      id="lbl-grade"
                      className="flex items-center justify-between p-3.5 bg-[#111318] border border-[#1f222b] rounded-lg cursor-pointer hover:border-[#00D1FF]/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white block">Material Grade verification</span>
                        <span className="text-[10px] text-[#717684] block">Is carbon/alloy steel mill correct</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checklist.materialGradeOk}
                        onChange={() => handleCheckboxChange('materialGradeOk')}
                        className="w-4 h-4 rounded text-[#00D1FF] bg-[#1C1F26] border-[#2D313C] focus:ring-[#00D1FF]"
                      />
                    </label>

                    {/* Surface finishing details */}
                    <label 
                      id="lbl-surface"
                      className="flex items-center justify-between p-3.5 bg-[#111318] border border-[#1f222b] rounded-lg cursor-pointer hover:border-[#00D1FF]/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white block">Surface Finish & Scales</span>
                        <span className="text-[10px] text-[#717684] block">Rust-free micro-stamping verified</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checklist.surfaceFinishOk}
                        onChange={() => handleCheckboxChange('surfaceFinishOk')}
                        className="w-4 h-4 rounded text-[#00D1FF] bg-[#1C1F26] border-[#2D313C] focus:ring-[#00D1FF]"
                      />
                    </label>

                    {/* Chemistry verify */}
                    <label 
                      id="lbl-chemistry"
                      className="flex items-center justify-between p-3.5 bg-[#111318] border border-[#1f222b] rounded-lg cursor-pointer hover:border-[#00D1FF]/30 transition-all md:col-span-2"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white block">Chemical Spectroanalysis</span>
                        <span className="text-[10px] text-[#717684] block">Core elements structure carbon ratio validated</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checklist.chemicalCompositionOk}
                        onChange={() => handleCheckboxChange('chemicalCompositionOk')}
                        className="w-4 h-4 rounded text-[#00D1FF] bg-[#1C1F26] border-[#2D313C] focus:ring-[#00D1FF]"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Result selection field */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[11px] font-bold uppercase text-[#717684] block">Clearance Certificate</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="qa-pass-btn"
                        onClick={() => setResult('PASS')}
                        className={`py-2 px-3.5 rounded-lg border text-xs font-bold transition-all ${
                          result === 'PASS'
                            ? 'bg-green-500/15 text-green-400 border-green-500/30 font-bold'
                            : 'bg-[#1C1F26] text-[#717684] border-[#1F222B]'
                        }`}
                      >
                        ✔ PASS
                      </button>
                      <button
                        type="button"
                        id="qa-fail-btn"
                        onClick={() => setResult('FAIL')}
                        className={`py-2 px-3.5 rounded-lg border text-xs font-bold transition-all ${
                          result === 'FAIL'
                            ? 'bg-red-500/15 text-red-500 border-red-500/30 font-bold'
                            : 'bg-[#1C1F26] text-[#717684] border-[#1F222B]'
                        }`}
                      >
                        ✘ FAIL
                      </button>
                    </div>
                  </div>

                  {result === 'FAIL' && (
                    <div className="space-y-1.5 md:col-span-2 animate-fade-in text-left">
                      <label className="text-[11px] font-bold uppercase text-red-400">Defect Code Category *</label>
                      <select
                        id="qa-defect-select"
                        required
                        value={defectCategory}
                        onChange={(e) => setDefectCategory(e.target.value)}
                        className="w-full bg-[#1C1F26] border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="">-- Choose Deficiency Signature --</option>
                        <option value="Brittle fatigue fracture stress limits failure">Brittle stress limits failure</option>
                        <option value="Microscale porosity cracks scale voids">Microscale porosity cracks voids</option>
                        <option value="Silicon/Carbon percentage alloy inconsistency">Silicon alloy inconsistency</option>
                        <option value="Physical thickness dimensional non-compliance">Thickness non-compliance</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Analytical Findings Reports & Certification Comments</label>
                  <textarea
                    id="qa-evaluation-findings"
                    rows={3}
                    required
                    placeholder="Provide microstructural metrics, hardness numbers (BHN/HRC), calibration parameters..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>

                <div className="pt-4 border-t border-[#1F222B] flex items-center justify-between">
                  <span className="text-[10px] text-[#717684] font-medium">Signed officially by: <strong className="text-white bg-[#1C1F26] px-1.5 py-0.5 rounded">{currentUserName}</strong></span>
                  <button
                    type="submit"
                    id="submit-insps-btn"
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                      result === 'PASS' ? 'bg-green-500 hover:bg-green-650' : 'bg-red-500 hover:bg-red-650'
                    }`}
                  >
                    Save & Route Certificate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* History lists */
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#1C1F26] px-6 py-4 border-b border-[#1F222B]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#717684]">Inspected Lab Log Database</h3>
          </div>

          <div className="divide-y divide-[#1F222B] max-h-[600px] overflow-y-auto">
            {inspections.length === 0 ? (
              <div className="text-center py-12 text-[#717684]">
                No processed laboratory certificates found.
              </div>
            ) : (
              inspections.map((insp) => (
                <div key={insp.id} className="p-5 hover:bg-[#161920]/40 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-[#00D1FF] bg-[#0A0B0E] py-0.5 px-2 rounded border border-[#1F222B]">
                        {insp.id}
                      </span>
                      <span className="text-xs text-neutral-300 font-bold">{insp.materialName}</span>
                      <span className="text-[10px] text-[#717684]">ID: {insp.materialId}</span>
                    </div>

                    <p className="text-xs text-[#717684] bg-[#161920] p-3 rounded border border-[#1F222B]/50 italic leading-relaxed">
                      "{insp.remarks}"
                    </p>

                    {insp.defectCategory && (
                      <span className="inline-block text-[10px] font-bold text-red-400 bg-red-400/5 px-2 py-0.5 rounded border border-red-500/15 uppercase font-mono">
                        Deficient: {insp.defectCategory}
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#525866] pt-1">
                      <span>Certified Date: {new Date(insp.date).toLocaleString()}</span>
                      <span>Inspector: <strong className="text-stone-300 font-semibold">{insp.inspectorName}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase ${
                      insp.result === 'PASS' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {insp.result}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {Object.entries(insp.checklist).map(([key, ok]) => (
                        <span 
                          key={key} 
                          className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${ok ? 'bg-green-500/5 text-green-400 border border-green-500/10' : 'bg-red-500/5 text-red-400 border border-red-500/10'}`}
                        >
                          {key.replace('Ok', '')}: {ok ? 'OK' : 'FAIL'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, Material, MaterialStatus, UserRole } from '../types';
import { Package, MapPin, Truck, AlertTriangle, ArrowUpRight, History, Calendar, HardHat, Compass } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  materials: Material[];
  currentUserRole: UserRole;
  currentUserName: string;
  onAllocateStock: (
    materialId: string, 
    warehouseLocation: string, 
    initialStock: number, 
    lowStockThreshold: number
  ) => void;
  onDispatchStock: (
    inventoryId: string, 
    quantity: number, 
    destination: string
  ) => void;
  onUpdateInventorySettings: (
    inventoryId: string,
    warehouseLocation: string,
    lowStockThreshold: number
  ) => void;
}

export default function InventoryView({
  inventory,
  materials,
  currentUserRole,
  currentUserName,
  onAllocateStock,
  onDispatchStock,
  onUpdateInventorySettings
}: InventoryViewProps) {
  // Quality passed material eligible to be added to inventory (status = QUALITY_PASSED)
  const pendingAllocation = materials.filter(m => m.status === MaterialStatus.QUALITY_PASSED);

  // Modal triggers
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState<InventoryItem | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<InventoryItem | null>(null);

  // Allocation state
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [allocatedLocation, setAllocatedLocation] = useState('Zone-A-Bin-01');
  const [allocatedQty, setAllocatedQty] = useState('');
  const [lowStockThresh, setLowStockThresh] = useState('5');
  const [allocError, setAllocError] = useState('');

  // Dispatch state
  const [dispatchQty, setDispatchQty] = useState('');
  const [dispatchDest, setDispatchDest] = useState('');
  const [dispError, setDispError] = useState('');

  // Config adjustments state
  const [configLocation, setConfigLocation] = useState('');
  const [configThresh, setConfigThresh] = useState('');

  const [activeTab, setActiveTab] = useState<'status' | 'log'>('status');

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAllocError('');
    if (!selectedMaterialId) {
      setAllocError('Please select a validated component batch key.');
      return;
    }
    const targetMat = materials.find(m => m.id === selectedMaterialId);
    if (!targetMat) return;

    const qty = parseFloat(allocatedQty);
    if (isNaN(qty) || qty <= 0) {
      setAllocError('Please specify stock volumes.');
      return;
    }
    if (qty > targetMat.quantity) {
      setAllocError(`Passed receipt volume limit is ${targetMat.quantity}. Please reconcile.`);
      return;
    }

    onAllocateStock(
      selectedMaterialId,
      allocatedLocation,
      qty,
      parseFloat(lowStockThresh) || 5
    );

    // Reset Form
    setSelectedMaterialId('');
    setAllocatedQty('');
    setAllocatedLocation('Zone-A-Bin-01');
    setLowStockThresh('5');
    setShowAllocateModal(false);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDispError('');
    if (!showDispatchModal) return;

    const qty = parseFloat(dispatchQty);
    if (isNaN(qty) || qty <= 0) {
      setDispError('Volume must be a positive number.');
      return;
    }

    if (qty > showDispatchModal.currentStock) {
      setDispError(`Insufficient stock. Current available volume is ${showDispatchModal.currentStock}.`);
      return;
    }

    if (!dispatchDest.trim()) {
      setDispError('Detailed assembly floor destination coordinates are required.');
      return;
    }

    onDispatchStock(showDispatchModal.id, qty, dispatchDest);

    // Reset Form
    setShowDispatchModal(null);
    setDispatchQty('');
    setDispatchDest('');
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSettingsModal) return;
    onUpdateInventorySettings(
      showSettingsModal.id,
      configLocation,
      parseFloat(configThresh) || 2
    );
    setShowSettingsModal(null);
  };

  const canManage = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.DTG_TEAM;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Despatch, Transport & Gate (DTG) Inventory Hub
          </h2>
          <p className="text-xs text-[#717684]">Allocate warehouse coordinate slots, monitor safe storage limits, and issue production line dispatches.</p>
        </div>

        <div className="flex gap-2.5">
          {canManage && pendingAllocation.length > 0 && (
            <button
              id="allocate-stock-trigger"
              onClick={() => {
                setShowAllocateModal(true);
                setSelectedMaterialId(pendingAllocation[0]?.id || '');
                setAllocatedQty(String(pendingAllocation[0]?.quantity || ''));
              }}
              className="bg-[#00D1FF] text-[#0A0B0E] hover:bg-[#00B8E0] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(0,209,255,0.15)] animate-pulse"
            >
              + ALLOCATE PASSED RAW MATERIALS ({pendingAllocation.length})
            </button>
          )}

          <div className="flex bg-[#111318] p-1 rounded-lg border border-[#1F222B]">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${activeTab === 'status' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
            >
              Active Stockyards
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${activeTab === 'log' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
            >
              Movement Logs
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'status' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.length === 0 ? (
            <div className="col-span-full bg-[#111318] border border-[#1F222B] rounded-xl text-center py-16 text-[#717684]">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#00D1FF]" />
              <h4 className="font-bold text-white text-sm">Store Vault Empty</h4>
              <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                No active raw materials stock allocations have occurred. Complete Quality inspections first, then allocate stock to secure bins.
              </p>
            </div>
          ) : (
            inventory.map((item) => {
              const isLow = item.currentStock <= item.lowStockThreshold;
              return (
                <div 
                  id={`inventory-card-${item.id}`}
                  key={item.id} 
                  className={`bg-[#111318] border rounded-xl overflow-hidden shadow-md flex flex-col justify-between transition-all ${
                    isLow ? 'border-yellow-500/30 bg-yellow-500/[0.01]' : 'border-[#1F222B]'
                  }`}
                >
                  <div className="p-5 space-y-4">
                    {/* ID Coordinate details */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-[#717684] font-bold uppercase tracking-wider block">Vault Record: {item.id}</span>
                        <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">{item.materialName}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold flex items-center gap-1 ${
                        isLow ? 'bg-yellow-500/15 text-yellow-500' : 'bg-[#1C1F26] text-stone-300'
                      }`}>
                        <MapPin className="w-3 h-3" /> {item.warehouseLocation}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-[#0F1116] rounded-lg border border-[#1F222B]/60">
                      <div>
                        <span className="text-[10px] text-[#717684] font-semibold block">Received</span>
                        <span className="font-mono text-sm font-semibold text-[#E0E0E0]">{item.quantityAvailable}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#717684] font-semibold block">Issued</span>
                        <span className="font-mono text-sm font-semibold text-red-400">{item.quantityUsed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#717684] font-semibold block">Current</span>
                        <span className="font-mono text-sm font-bold text-white">{item.currentStock}</span>
                      </div>
                    </div>

                    {isLow && (
                      <div className="flex items-center gap-2 text-[10px] text-yellow-500 bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                        <span>Reorder threshold breached (Level: {item.currentStock} ≤ {item.lowStockThreshold})</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0F1116] border-t border-[#1F222B] px-5 py-3 flex items-center justify-between">
                    <span className="text-[10px] text-[#717684] font-medium font-mono">
                      Last update: {new Date(item.lastMovedDate).toLocaleDateString()}
                    </span>

                    <div className="flex gap-2">
                      {canManage && (
                        <>
                          <button
                            id={`config-inventory-${item.id}`}
                            onClick={() => {
                              setShowSettingsModal(item);
                              setConfigLocation(item.warehouseLocation);
                              setConfigThresh(String(item.lowStockThreshold));
                            }}
                            className="bg-transparent hover:bg-[#1C1F26] border border-[#2D313C] px-2.5 py-1 rounded text-[10px] font-bold text-stone-300 transition-all font-mono"
                            title="Configure storage zones"
                          >
                            Config
                          </button>
                          
                          {item.currentStock > 0 && (
                            <button
                              id={`dispatch-inventory-${item.id}`}
                              onClick={() => {
                                setShowDispatchModal(item);
                              }}
                              className="bg-[#00D1FF] hover:bg-[#00B8E0] text-[#0A0B0E] px-2.5 py-1 rounded text-[10px] font-bold transition-all"
                            >
                              Issue to Floor
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Movement history timeline logs */
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden p-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#717684] font-mono flex items-center gap-2">
            <History className="w-4 h-4 text-[#00D1FF]" />
            Plant Inventory Movement logs
          </h3>

          <div className="space-y-4">
            {inventory.flatMap(item => 
              item.movementHistory.map((m, idx) => ({ ...m, materialName: item.materialName, recordId: item.id, uniqueKey: `${item.id}-${idx}` }))
            )
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((log) => (
              <div key={log.uniqueKey} className="p-4 bg-[#1C1F26] rounded-xl border border-[#1F222B] flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-lg text-xs font-bold uppercase ${
                    log.type === 'ADD' ? 'bg-green-500/10 text-green-400' : log.type === 'DISPATCH' ? 'bg-[#00D1FF]/10 text-[#00D1FF]' : 'bg-pink-400/10 text-pink-300'
                  }`}>
                    {log.type}
                  </div>
                  <div>
                    <p className="font-bold text-white">{log.materialName}</p>
                    <p className="text-[10px] text-[#717684] mt-0.5">
                      Type: {log.type} | Volume: <strong className="text-stone-300">{log.quantity} Units</strong> | Destination: <strong className="text-white bg-[#0A0B0E] px-1 rounded">{log.destination}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1 text-[#717684] font-medium font-mono text-[10px]">
                  <div className="flex items-center justify-end gap-1 text-stone-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#525866]" />
                    {new Date(log.date).toLocaleString()}
                  </div>
                  <p>Operated by: {log.operator}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALLOCATE PASSED MATERIAL STOCK MODAL */}
      {showAllocateModal && (
        <div 
          id="allocate-stock-modal"
          className="fixed inset-0 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-[#111318] border border-[#1F222B] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F1116] border-b border-[#1F222B] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">New Storage Stock Allocation</h3>
              <button 
                id="close-allocate-modal-btn"
                onClick={() => setShowAllocateModal(false)}
                className="text-[#717684] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="p-6 space-y-4 text-left">
              {allocError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg font-semibold">
                  {allocError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Qualified Raw Material Batch *</label>
                <select
                  id="alloc-material-select"
                  required
                  value={selectedMaterialId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedMaterialId(id);
                    const mat = pendingAllocation.find(m => m.id === id);
                    if (mat) setAllocatedQty(String(mat.quantity));
                  }}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                >
                  {pendingAllocation.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name} ({m.quantity} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Physical Warehouses Zone Location *</label>
                  <select
                    id="alloc-location-select"
                    required
                    value={allocatedLocation}
                    onChange={(e) => setAllocatedLocation(e.target.value)}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  >
                    <option value="Zone-A-Bin-01">Zone-A-Bin-01 (heavy Castings)</option>
                    <option value="Zone-A-Bin-02">Zone-A-Bin-02 (Heavy Forgings)</option>
                    <option value="Zone-B-Bin-10">Zone-B-Bin-10 (Boiler Tubing)</option>
                    <option value="Zone-B-Bin-12">Zone-B-Bin-12 (Tubes & Coils)</option>
                    <option value="Zone-C-Bin-05">Zone-C-Bin-05 (Generator Sheets)</option>
                    <option value="Zone-C-Bin-08">Zone-C-Bin-08 (Weld Auxiliaries)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Verified Weight/Volume *</label>
                  <input
                    id="alloc-qty-input"
                    type="number"
                    required
                    step="any"
                    value={allocatedQty}
                    onChange={(e) => setAllocatedQty(e.target.value)}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Low Stock Safe Limit Red Alert Threshold Value *</label>
                <input
                  id="alloc-thresh-input"
                  type="number"
                  required
                  placeholder="Red alert trigger level"
                  value={lowStockThresh}
                  onChange={(e) => setLowStockThresh(e.target.value)}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="pt-4 border-t border-[#1F222B] flex justify-end gap-3">
                <button
                  type="button"
                  id="cancel-alloc-btn"
                  onClick={() => setShowAllocateModal(false)}
                  className="bg-transparent hover:bg-[#1C1F26] text-white border border-[#2D313C] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-allocation-entry"
                  className="bg-[#00D1FF] hover:bg-[#00B8E0] text-[#0A0B0E] px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Allocate Stock to Storage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH/ISSUE STOCK TO ASSEMBLY LINE MODAL */}
      {showDispatchModal && (
        <div 
          id="dispatch-stock-modal"
          className="fixed inset-0 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-[#111318] border border-[#1F222B] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F1116] border-b border-[#1F222B] px-6 py-4 flex items-center justify-between animate-fade-in">
              <div>
                <h3 className="font-bold text-white text-base">Issue Material to Production floor</h3>
                <p className="text-xs text-[#717684]">Stockyard Item Key: {showDispatchModal.id} ({showDispatchModal.materialName})</p>
              </div>
              <button 
                id="close-dispatch-modal"
                onClick={() => setShowDispatchModal(null)}
                className="text-[#717684] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-4 text-left">
              {dispError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg font-semibold animate-pulse">
                  {dispError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Maximum Stock Available</label>
                  <p className="text-base font-mono font-bold text-[#00D1FF] bg-[#1C1F26] p-2.5 rounded-lg border border-[#1D2229]">
                    {showDispatchModal.currentStock} Units
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Volume count to release *</label>
                  <input
                    id="dispatch-qty-input"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5"
                    value={dispatchQty}
                    onChange={(e) => setDispatchQty(e.target.value)}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Assembly Area / Line Station destination *</label>
                <select
                  id="dispatch-destination"
                  required
                  value={dispatchDest}
                  onChange={(e) => setDispatchDest(e.target.value)}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                >
                  <option value="">-- Choose Assembly Line Bay --</option>
                  <option value="Steam Turbine Pit Assembly Zone-3">Steam Turbine Pit Assembly Zone-3</option>
                  <option value="Boiler Weld Header Line-1A">Boiler Weld Header Line-1A</option>
                  <option value="Electric Core Magnetic Lamination Bay">Electric Core Magnetic Lamination Bay</option>
                  <option value="Condenser Heat Exchange Block-D">Condenser Heat Exchange Block-D</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#1F222B] flex justify-end gap-3">
                <button
                  type="button"
                  id="cancel-dispatch-modal"
                  onClick={() => setShowDispatchModal(null)}
                  className="bg-transparent hover:bg-[#1C1F26] text-white border border-[#2D313C] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-dispatch-btn"
                  className="bg-[#00D1FF] hover:bg-[#00B8E0] text-[#0A0B0E] px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Issue Material & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STORAGE CONFIGURATION MODAL */}
      {showSettingsModal && (
        <div 
          id="settings-stock-modal"
          className="fixed inset-0 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-[#111318] border border-[#1F222B] w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F1116] border-b border-[#1F222B] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Adjust Coordinate Safeguards</h3>
              <button 
                id="close-settings-modal"
                onClick={() => setShowSettingsModal(null)}
                className="text-[#717684] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Physical Warehouses Zone Coordinate</label>
                <input
                  id="config-location-input"
                  type="text"
                  required
                  value={configLocation}
                  onChange={(e) => setConfigLocation(e.target.value)}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Safeguards Low Stock Trigger Level</label>
                <input
                  id="config-thresh-input"
                  type="number"
                  required
                  value={configThresh}
                  onChange={(e) => setConfigThresh(e.target.value)}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="pt-4 border-t border-[#1F222B] flex justify-end gap-3">
                <button
                  type="button"
                  id="cancel-config-btn"
                  onClick={() => setShowSettingsModal(null)}
                  className="bg-transparent hover:bg-[#1C1F26] text-white border border-[#2D313C] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-config-btn"
                  className="bg-[#00D1FF] hover:bg-[#00B8E0] text-[#0A0B0E] px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

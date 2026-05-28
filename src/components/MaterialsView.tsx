/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Material, MaterialStatus, UserRole } from '../types';
import QRVector from './QRVector';
import { Search, Filter, Calendar, Truck, ArrowUpDown, ChevronLeft, ChevronRight, Check, X, FileText, Trash2, Award, QrCode } from 'lucide-react';

interface MaterialsViewProps {
  materials: Material[];
  currentUserRole: UserRole;
  currentUserName: string;
  onCreateMaterial: (materialData: Omit<Material, 'id' | 'arrivalDate' | 'status' | 'timestamp' | 'updatedBy'>) => void;
  onUpdateStatus: (id: string, action: 'ACCEPT' | 'REJECT', rejectionReason?: string, gateTeamRemarks?: string) => void;
  onDeleteMaterial?: (id: string) => void;
  onSelectMaterial: (m: Material) => void;
}

export default function MaterialsView({
  materials,
  currentUserRole,
  currentUserName,
  onCreateMaterial,
  onUpdateStatus,
  onDeleteMaterial,
  onSelectMaterial
}: MaterialsViewProps) {
  // Filters and states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'id' | 'arrivalDate' | 'quantity'>('arrivalDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form triggers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState<Material | null>(null);
  
  // Gate decisions
  const [gateAction, setGateAction] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');
  const [rejectionReason, setRejectionReason] = useState('');
  const [gateRemarks, setGateRemarks] = useState('');

  // Add material form state
  const [materialForm, setMaterialForm] = useState({
    name: '',
    vendorName: '',
    vendorId: '',
    purchaseOrderNumber: '',
    quantity: '',
    unit: 'Tons',
    vehicleNumber: '',
    invoiceNumber: '',
    description: '',
    currentLocation: 'Gate 1 Heavy Weigh Station'
  });

  const [formError, setFormError] = useState('');

  // Sorting helper
  const handleSort = (field: 'id' | 'arrivalDate' | 'quantity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filtered = materials.filter(m => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = 
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.vendorName.toLowerCase().includes(q) ||
      m.purchaseOrderNumber.toLowerCase().includes(q) ||
      m.invoiceNumber.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Sort Logic
  const sorted = [...filtered].sort((a,b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'arrivalDate') {
      return (new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime()) * factor;
    }
    if (sortBy === 'quantity') {
      return (a.quantity - b.quantity) * factor;
    }
    return a.id.localeCompare(b.id) * factor;
  });

  // Pagination bounds
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const offset = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(offset, offset + itemsPerPage);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const { name, vendorName, purchaseOrderNumber, quantity, unit, vehicleNumber, invoiceNumber } = materialForm;
    if (!name || !vendorName || !purchaseOrderNumber || !quantity || !unit || !vehicleNumber || !invoiceNumber) {
      setFormError('All fields marked with * are strictly mandatory.');
      return;
    }
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setFormError('Please input a valid positive quantity numerical value.');
      return;
    }

    onCreateMaterial({
      ...materialForm,
      quantity: parsedQty,
      vendorId: materialForm.vendorId || `VND-${vendorName.toUpperCase().replace(/\s+/g, '-').slice(0, 8)}`
    });

    // Reset Form
    setMaterialForm({
      name: '',
      vendorName: '',
      vendorId: '',
      purchaseOrderNumber: '',
      quantity: '',
      unit: 'Tons',
      vehicleNumber: '',
      invoiceNumber: '',
      description: '',
      currentLocation: 'Gate 4 Heavy Weigh Station'
    });
    setShowAddModal(false);
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showGateModal) return;
    if (gateAction === 'REJECT' && !rejectionReason.trim()) {
      alert('Please specify a rejection reason code.');
      return;
    }
    onUpdateStatus(showGateModal.id, gateAction, rejectionReason, gateRemarks);
    setShowGateModal(null);
    setRejectionReason('');
    setGateRemarks('');
  };

  const canCreate = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MATERIAL_TEAM;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header operations bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Material Arrival Registers
          </h2>
          <p className="text-xs text-[#717684]">Manage, sort, print high-resolution QR tracking code labels, and inspect vehicles.</p>
        </div>
        {canCreate && (
          <button
            id="new-material-form-trigger"
            onClick={() => setShowAddModal(true)}
            className="bg-[#00D1FF] text-[#0A0B0E] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#00B8E0] transition-colors shadow-[0_0_12px_rgba(0,209,255,0.15)]"
          >
            + REGISTER ARRIVAL TICKET
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS PANEL */}
      <div className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-[#525866]">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="material-search-input"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search Material ID, Vendor PO, or Invoices..."
            className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg py-1.5 pl-10 pr-4 text-xs text-[#E0E0E0] placeholder-[#525866] focus:outline-none focus:border-[#00D1FF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1C1F26] border border-[#2D313C] px-3 py-1 rounded-lg">
            <span className="text-[10px] text-[#717684] uppercase font-bold tracking-wider">Status:</span>
            <select
              id="material-status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Lifecycle Codes</option>
              <option value="PENDING">PENDING Gate Inspect</option>
              <option value="ACCEPTED">ACCEPTED (In QA QA)</option>
              <option value="REJECTED">REJECTED from Gate</option>
              <option value="QUALITY_PASSED">QA PASSED</option>
              <option value="QUALITY_FAILED">QA FAILED (Returned)</option>
              <option value="IN_STOCK">IN_STOCK (Warehouse)</option>
              <option value="DISPATCHED">DISPATCHED (Floor)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F1116] text-[#717684] uppercase font-bold border-b border-[#1F222B]">
              <tr>
                <th 
                  onClick={() => handleSort('id')}
                  className="px-6 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Material Key / QR
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#525866]" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Vendor / Purchase Order</th>
                <th className="px-6 py-3.5 font-mono">Invoice / Vol</th>
                <th 
                  onClick={() => handleSort('arrivalDate')}
                  className="px-6 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Arrival Details
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#525866]" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Current Location</th>
                <th className="px-6 py-3.5">Workflow Status</th>
                <th className="px-6 py-3.5 justify-end text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F222B]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#717684]">
                    No material entries matched your criteria queries.
                  </td>
                </tr>
              ) : (
                paginated.map((m) => {
                  const getStatusStyle = (status: MaterialStatus) => {
                    switch (status) {
                      case MaterialStatus.PENDING:
                        return 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/20';
                      case MaterialStatus.ACCEPTED:
                        return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
                      case MaterialStatus.REJECTED:
                        return 'bg-red-400/10 text-red-400 border-red-500/20';
                      case MaterialStatus.QUALITY_PASSED:
                        return 'bg-green-500/10 text-green-400 border-green-500/20';
                      case MaterialStatus.QUALITY_FAILED:
                        return 'bg-red-500/10 text-red-500 border-red-500/20';
                      case MaterialStatus.IN_STOCK:
                        return 'bg-pink-400/10 text-pink-300 border-pink-500/20';
                      case MaterialStatus.DISPATCHED:
                        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                      default:
                        return 'bg-zinc-500/10 text-zinc-400';
                    }
                  };

                  return (
                    <tr 
                      id={`material-row-${m.id}`}
                      key={m.id} 
                      className={`hover:bg-[#161920]/40 transition-colors ${m.status === MaterialStatus.REJECTED || m.status === MaterialStatus.QUALITY_FAILED ? 'bg-red-950/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            id={`qr-btn-${m.id}`}
                            onClick={() => onSelectMaterial(m)}
                            className="p-1.5 bg-[#1C1F26] border border-[#1F222B] rounded text-[#00D1FF] hover:bg-[#2D313C]"
                            title="Print Label & Inspect QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <div>
                            <span 
                              onClick={() => onSelectMaterial(m)}
                              className="font-mono font-bold text-white hover:text-[#00D1FF] cursor-pointer transition-colors block"
                            >
                              {m.id}
                            </span>
                            <span className="text-[10px] text-[#717684] block font-semibold truncate max-w-[120px]">{m.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-[#E0E0E0] truncate max-w-[180px]">{m.vendorName}</p>
                        <p className="text-[10px] font-mono text-[#717684]">PO: {m.purchaseOrderNumber}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-stone-300 font-medium">{m.invoiceNumber}</p>
                        <p className="text-[11px] font-mono text-[#00D1FF] font-bold">
                          {m.quantity} {m.unit}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[#E0E0E0] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#525866]" />
                          {new Date(m.arrivalDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#717684]">
                          <Truck className="w-3 h-3" />
                          {m.vehicleNumber}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[#717684] font-medium truncate max-w-[150px]">
                        {m.currentLocation}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusStyle(m.status)}`}>
                          {m.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`view-details-${m.id}`}
                            onClick={() => onSelectMaterial(m)}
                            className="bg-[#1C1F26] hover:bg-[#2D313C] border border-[#2D313C] text-white px-2.5 py-1 rounded text-[10px] font-bold"
                          >
                            Details
                          </button>

                          {m.status === MaterialStatus.PENDING && (currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MATERIAL_TEAM) && (
                            <button
                              id={`gate-action-${m.id}`}
                              onClick={() => {
                                setShowGateModal(m);
                                setGateAction('ACCEPT');
                              }}
                              className="bg-[#00D1FF] text-[#0A0B0E] hover:bg-[#00B8E0] px-2.5 py-1 rounded text-[10px] font-bold"
                            >
                              Gate Decision
                            </button>
                          )}

                          {currentUserRole === UserRole.ADMIN && onDeleteMaterial && (
                            <button
                              id={`delete-btn-${m.id}`}
                              onClick={() => {
                                if (confirm(`Purge arrival record ${m.id}? This irreversible action cleans up corresponding stock.`)) {
                                  onDeleteMaterial(m.id);
                                }
                              }}
                              className="p-1 text-red-400 hover:text-red-500 rounded hover:bg-red-500/10"
                              title="Delete Material Receipt"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="bg-[#0F1116] border-t border-[#1F222B] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-[#717684] font-medium">
            Showing <span className="text-white">{sorted.length === 0 ? 0 : offset + 1}</span> to{' '}
            <span className="text-white">{Math.min(offset + itemsPerPage, sorted.length)}</span> of{' '}
            <span className="text-white font-mono">{sorted.length}</span> materials
          </div>
          <div className="flex items-center gap-2">
            <button
              id="prev-page-btn"
              onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#1C1F26] border border-[#2D313C] rounded-lg text-white hover:bg-[#2D313C] disabled:opacity-30 disabled:hover:bg-[#1C1F26] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-bold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              id="next-page-btn"
              onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-[#1C1F26] border border-[#2D313C] rounded-lg text-white hover:bg-[#2D313C] disabled:opacity-30 disabled:hover:bg-[#1C1F26] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD MATERIAL MODAL FORM */}
      {showAddModal && (
        <div 
          id="add-material-modal"
          className="fixed inset-0 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div className="bg-[#111318] border border-[#1F222B] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F1116] border-b border-[#1F222B] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">New Gateside Arrival Registration</h3>
              <button 
                id="close-add-modal-btn"
                onClick={() => setShowAddModal(false)}
                className="text-[#717684] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Material Nomenclature *</label>
                  <input
                    id="form-item-name"
                    type="text"
                    required
                    placeholder="e.g. Copper Condenser Tubing"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-[#717684]">Quantity Volume *</label>
                    <input
                      id="form-item-qty"
                      type="number"
                      required
                      step="any"
                      placeholder="e.g. 450"
                      value={materialForm.quantity}
                      onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                      className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-[#717684]">Unit *</label>
                    <select
                      id="form-item-unit"
                      value={materialForm.unit}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                      className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                    >
                      <option value="Tons">Tons</option>
                      <option value="Units">Units</option>
                      <option value="Kgs">Kgs</option>
                      <option value="Metre">Metre</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Consolidated Vendor Name *</label>
                  <input
                    id="form-item-vendor"
                    type="text"
                    required
                    placeholder="e.g. Jindal Steel Mill"
                    value={materialForm.vendorName}
                    onChange={(e) => setMaterialForm({ ...materialForm, vendorName: e.target.value })}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Purchase Order Number (PO) *</label>
                  <input
                    id="form-item-po"
                    type="text"
                    required
                    placeholder="e.g. PO/2026/8812/QA"
                    value={materialForm.purchaseOrderNumber}
                    onChange={(e) => setMaterialForm({ ...materialForm, purchaseOrderNumber: e.target.value })}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Invoice Number *</label>
                  <input
                    id="form-item-invoice"
                    type="text"
                    required
                    placeholder="e.g. INV-JSM-88219"
                    value={materialForm.invoiceNumber}
                    onChange={(e) => setMaterialForm({ ...materialForm, invoiceNumber: e.target.value })}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#717684]">Vehicle Registration Number *</label>
                  <input
                    id="form-item-vehicle"
                    type="text"
                    required
                    placeholder="e.g. MP-04-HE-1192"
                    value={materialForm.vehicleNumber}
                    onChange={(e) => setMaterialForm({ ...materialForm, vehicleNumber: e.target.value })}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Detailed Component Specifications Remarks</label>
                <textarea
                  id="form-item-desc"
                  placeholder="Thickness, grade compliance standards..."
                  rows={2}
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="pt-4 border-t border-[#1F222B] flex justify-end gap-3">
                <button
                  type="button"
                  id="cancel-add-modal-btn"
                  onClick={() => setShowAddModal(false)}
                  className="bg-transparent hover:bg-[#1C1F26] text-white border border-[#2D313C] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-arrival-btn"
                  className="bg-[#00D1FF] hover:bg-[#00B8E0] text-[#0A0B0E] px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Confirm Gate Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATE DECISION (ACCEPT/REJECT) MODAL */}
      {showGateModal && (
        <div 
          id="gate-decision-modal"
          className="fixed inset-0 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div className="bg-[#111318] border border-[#1F222B] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F1116] border-b border-[#1F222B] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Gate Inspection Verification</h3>
                <p className="text-xs text-[#717684]">Ticket Key: {showGateModal.id} ({showGateModal.name})</p>
              </div>
              <button 
                id="close-gate-modal-btn"
                onClick={() => setShowGateModal(null)}
                className="text-[#717684] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGateSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684] block">Determine Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="gate-action-accept-btn"
                    onClick={() => setGateAction('ACCEPT')}
                    className={`py-3.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      gateAction === 'ACCEPT'
                        ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
                        : 'bg-[#1C1F26] text-[#717684] border-[#1F222B] hover:text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" /> ACCEPT ARRIVAL
                  </button>
                  <button
                    type="button"
                    id="gate-action-reject-btn"
                    onClick={() => setGateAction('REJECT')}
                    className={`py-3.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      gateAction === 'REJECT'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                        : 'bg-[#1C1F26] text-[#717684] border-[#1F222B] hover:text-white'
                    }`}
                  >
                    <X className="w-4 h-4" /> REJECT AT GATE
                  </button>
                </div>
              </div>

              {gateAction === 'REJECT' ? (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[11px] font-bold uppercase text-red-400">Rejection Reason *</label>
                  <select
                    id="gate-reject-reason-select"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">-- Choose Reason Standard --</option>
                    <option value="Heavy Moisture Damage & Rust Scale">Heavy Moisture Damage & Rust Scale</option>
                    <option value="Invoice parameterMismatch (PO specs discrepancy)">Invoice mismatch (PO discrepancy)</option>
                    <option value="Physical Transport Crack Strain">Physical transport crack strain</option>
                    <option value="Over-limit Shipment volume refusal">Over-limit shipment volume refusal</option>
                  </select>
                </div>
              ) : (
                <div className="text-xs text-green-400 bg-green-500/5 p-3 rounded-lg border border-green-500/10 flex items-start gap-2 animate-fade-in">
                  <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Gate Routing clearance:</strong> Material passes invoice matching checks and gets routed to the <strong>Quality Inspection Quarantine Lab</strong>.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Decision Remarks & Vehicle Dispatch notes</label>
                <textarea
                  id="gate-remarks-area"
                  rows={2}
                  placeholder="Add weight receipt metrics, driver signatures..."
                  value={gateRemarks}
                  onChange={(e) => setGateRemarks(e.target.value)}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="pt-4 border-t border-[#1F222B] flex justify-end gap-3">
                <button
                  type="button"
                  id="cancel-gate-modal-btn"
                  onClick={() => setShowGateModal(null)}
                  className="bg-transparent hover:bg-[#1C1F26] text-white border border-[#2D313C] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-gate-decision-btn"
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white ${
                    gateAction === 'REJECT' ? 'bg-red-500 hover:bg-red-650' : 'bg-green-500 hover:bg-green-650'
                  }`}
                >
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

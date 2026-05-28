/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KPICards } from '../types';
import { Layers, CheckSquare, XOctagon, Loader, HardHat, AlertTriangle, ArrowUpRight, BarChart3, TrendingUp, Compass, Users } from 'lucide-react';

interface AnalyticsData {
  monthlyArrivals: { month: string; count: number }[];
  passFailRatio: { pass: number; fail: number };
  inventoryDist: { name: string; value: number }[];
  vendorLeaderboard: { name: string; count: number }[];
}

interface DashboardViewProps {
  cards: KPICards;
  analytics: AnalyticsData;
  onNavigateToMaterials: () => void;
  onNavigateToQuality: () => void;
  onNavigateToInventory: () => void;
  onTriggerNewMaterial: () => void;
}

export default function DashboardView({
  cards,
  analytics,
  onNavigateToMaterials,
  onNavigateToQuality,
  onNavigateToInventory,
  onTriggerNewMaterial
}: DashboardViewProps) {
  const [activeChartTab, setActiveChartTab] = useState<'arrivals' | 'quality' | 'vendors'>('arrivals');

  // Math for SVG rendering
  const maxArrivalCount = Math.max(...analytics.monthlyArrivals.map(d => d.count), 1);
  const totalPassFail = (analytics.passFailRatio.pass + analytics.passFailRatio.fail) || 1;
  const passPercent = Math.round((analytics.passFailRatio.pass / totalPassFail) * 100);
  const failPercent = 100 - passPercent;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Operations Control Module
            <span className="text-[10px] uppercase bg-[#00D1FF]/15 text-[#00D1FF] border border-[#00D1FF]/20 px-2 py-0.5 rounded-full font-mono tracking-widest animate-pulse">
              Live Monitor
            </span>
          </h2>
          <p className="text-sm text-[#717684]">
            Secure digital tracking of materials from entry point reception, quality assurance clearances, to DTG inventory placement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="register-arrival-dashboard-btn"
            onClick={onTriggerNewMaterial}
            className="bg-[#00D1FF] text-[#0A0B0E] font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-[#00B8E0] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,209,255,0.25)]"
          >
            + REGISTER NEW ARRIVAL
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Materials */}
        <div 
          onClick={onNavigateToMaterials}
          className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl cursor-pointer hover:border-[#00D1FF]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#717684] font-medium uppercase tracking-wider">Total Received</span>
            <span className="p-1.5 bg-[#1C1F26] text-[#717684] group-hover:text-white rounded-lg transition-colors">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-[#E0E0E0]">{cards.totalMaterialsCount}</p>
          <span className="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Gate Entry Valid
          </span>
        </div>

        {/* Accepted at Gate */}
        <div 
          onClick={onNavigateToMaterials}
          className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl cursor-pointer hover:border-[#00D1FF]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#717684] font-medium uppercase tracking-wider">Gate Cleared</span>
            <span className="p-1.5 bg-[#1C1F26] text-[#717684] group-hover:text-white rounded-lg transition-colors">
              <CheckSquare className="w-4 h-4 text-green-400" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-green-400">{cards.acceptedGateCount}</p>
          <span className="text-[10px] text-[#717684] mt-1 block">To Inspection quarantine</span>
        </div>

        {/* Rejected at Gate */}
        <div 
          onClick={onNavigateToMaterials}
          className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl cursor-pointer hover:border-red-500/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#717684] font-medium uppercase tracking-wider">Gate Rejected</span>
            <span className="p-1.5 bg-[#1C1F26] text-[#717684] group-hover:text-white rounded-lg transition-colors">
              <XOctagon className="w-4 h-4 text-red-400" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-red-400">{cards.rejectedGateCount}</p>
          <span className="text-[10px] text-[#717684] mt-1 block">Returned to vendor (Closed)</span>
        </div>

        {/* Pending QA Inspect */}
        <div 
          onClick={onNavigateToQuality}
          className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl cursor-pointer hover:border-[#00D1FF]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#717684] font-medium uppercase tracking-wider">Pending QA</span>
            <span className="p-1.5 bg-[#1C1F26] text-[#717684] group-hover:text-white rounded-lg transition-colors">
              <Loader className="w-4 h-4 text-[#00D1FF] animate-spin" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-[#00D1FF]">{cards.pendingInspectionCount}</p>
          <span className="text-[10px] text-yellow-500 font-medium flex items-center gap-1 mt-1">
            Quarantined in QA Lab
          </span>
        </div>

        {/* Active Storage Stock */}
        <div 
          onClick={onNavigateToInventory}
          className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl cursor-pointer hover:border-[#00D1FF]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#717684] font-medium uppercase tracking-wider">Total Inventory</span>
            <span className="p-1.5 bg-[#1C1F26] text-[#717684] group-hover:text-white rounded-lg transition-colors">
              <HardHat className="w-4 h-4 text-pink-400" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">{cards.inventoryTotalStock}</p>
          <span className="text-[10px] text-pink-400 font-medium block mt-1">Available for Production</span>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={onNavigateToInventory}
          className="bg-[#111318] border border-[#1F222B] p-4 rounded-xl cursor-pointer hover:border-[#FF5656]/40 transition-all hover:translate-y-[-2px] group relative overflow-hidden"
        >
          {cards.lowStockCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-lg"></span>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#717684] font-medium uppercase tracking-wider">Low Stock</span>
            <span className="p-1.5 bg-[#1C1F26] text-[#717684] group-hover:text-white rounded-lg transition-colors">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </span>
          </div>
          <p className={`text-2xl font-mono font-bold ${cards.lowStockCount > 0 ? 'text-yellow-400 animate-pulse' : 'text-[#717684]'}`}>
            {cards.lowStockCount}
          </p>
          <span className={`text-[10px] font-medium block mt-1 ${cards.lowStockCount > 0 ? 'text-yellow-500' : 'text-[#717684]'}`}>
            {cards.lowStockCount > 0 ? 'Requires re-order action' : 'All safe thresholds'}
          </span>
        </div>
      </div>

      {/* Advanced Analytic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard Widget */}
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden shadow-md lg:col-span-2 flex flex-col">
          <div className="bg-[#1C1F26] px-6 py-4 border-b border-[#1F222B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00D1FF]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">BHEL Plant Analytics</h3>
            </div>
            
            {/* Native Tab Controllers */}
            <div className="flex bg-[#0A0B0E] p-1 rounded-lg border border-[#1F222B]">
              <button
                onClick={() => setActiveChartTab('arrivals')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeChartTab === 'arrivals' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
              >
                Arrival History
              </button>
              <button
                onClick={() => setActiveChartTab('quality')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeChartTab === 'quality' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
              >
                Quality Pass Ratio
              </button>
              <button
                onClick={() => setActiveChartTab('vendors')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeChartTab === 'vendors' ? 'bg-[#00D1FF] text-[#0A0B0E]' : 'text-[#717684] hover:text-white'}`}
              >
                Top Vendors
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center min-h-[290px]">
            {activeChartTab === 'arrivals' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#717684] font-medium">BHEL Incoming Shipments Load Trend</span>
                  <span className="text-xs font-bold text-[#00D1FF] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> High volume cycle
                  </span>
                </div>
                {/* SVG arrival chart */}
                <div className="h-44 w-full flex items-end justify-between pt-4 pb-2 border-b border-[#1F222B] px-4">
                  {analytics.monthlyArrivals.map((val) => {
                    // Height calculation logic mapping count
                    const heightPercent = Math.max((val.count / maxArrivalCount) * 100, 10);
                    return (
                      <div key={val.month} className="flex-1 flex flex-col items-center group relative px-1">
                        <div className="absolute bottom-full mb-1 bg-[#1C1F26] border border-[#2D313C] px-2 py-0.5 rounded text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {val.count} Shipments
                        </div>
                        <div 
                          className="w-8 sm:w-12 bg-gradient-to-t from-[#00D1FF]/20 to-[#00D1FF] rounded-t group-hover:from-[#00D1FF]/40 group-hover:to-[#00B8E0] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,209,255,0.05)]"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-xs font-semibold font-mono text-[#717684] mt-2 block">{val.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeChartTab === 'quality' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="text-center md:text-left">
                    <p className="text-sm font-semibold text-white">QA Inspection Clearance Ratio</p>
                    <p className="text-3xl font-mono font-bold text-[#00D1FF] mt-1">{passPercent}% Pass</p>
                    <p className="text-xs text-[#717684] mt-1">Based on rigorous physical and chemical test specifications.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-green-400">PASSED ({analytics.passFailRatio.pass})</span>
                      <span className="text-red-400">FAILED ({analytics.passFailRatio.fail})</span>
                    </div>
                    <div className="w-full bg-[#1C1F26] h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-green-400 h-full" style={{ width: `${passPercent}%` }}></div>
                      <div className="bg-red-400 h-full" style={{ width: `${failPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#1F222B]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-400"
                        strokeDasharray={`${passPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-xl font-mono font-bold text-white">{passPercent}%</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#717684]">Standard Pass</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeChartTab === 'vendors' && (
              <div className="space-y-4">
                <p className="text-xs text-[#717684] font-medium mb-2">BHEL Consolidated Vendor Frequency Leaderboard</p>
                <div className="space-y-3">
                  {analytics.vendorLeaderboard.map((v, index) => (
                    <div key={v.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#E0E0E0]">{index + 1}. {v.name}</span>
                        <span className="font-mono text-[#00D1FF] font-bold">{v.count} Arrivals</span>
                      </div>
                      <div className="w-full bg-[#1C1F26] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00D1FF] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min((v.count / 8) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Warehouse Inventory Layout map */}
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#717684] flex items-center gap-1.5 font-mono">
              <Compass className="w-4 h-4 text-pink-400" />
              Warehouse Zones Allocation
            </h3>
            <p className="text-xs text-[#717684]">
              Location and capacity distribution across physical DTG secure storage zones.
            </p>
          </div>

          <div className="my-6 space-y-4 flex-1 flex flex-col justify-center">
            {analytics.inventoryDist.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#525866]">
                Inventory stockyards empty. Verify passed inspector materials.
              </div>
            ) : (
              analytics.inventoryDist.map((zone) => (
                <div key={zone.name} className="flex items-center justify-between border-b border-[#1F222B]/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-pink-400 rounded"></div>
                    <span className="text-xs font-semibold text-white font-mono">{zone.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-white text-right">
                    {zone.value} Tons/Units
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={onNavigateToInventory}
            className="w-full bg-[#1C1F26] hover:bg-[#2D313C] text-xs font-bold text-white py-2 px-4 rounded-lg font-mono border border-[#1F222B] text-center transition-all"
          >
            OPEN INVENTORY MONITOR
          </button>
        </div>
      </div>

      {/* Quick Access Grid Actions */}
      <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Functional Workflow Integrity Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#1C1F26] border border-[#1F222B] rounded-lg">
            <div className="font-bold text-[#00D1FF] mb-1">1. GATESIDE RECEIPT</div>
            <p className="text-[11px] text-[#717684]">Log arrival PO parameters, scan invoice values & assign a verified tracking ID.</p>
          </div>
          <div className="p-3 bg-[#1C1F26] border border-[#1F222B] rounded-lg">
            <div className="font-bold text-green-400 mb-1">2. ROUTING CONTROL</div>
            <p className="text-[11px] text-[#717684]">Accepting a ticket forwards it directly into Quality quarantine and generates unique QR codes.</p>
          </div>
          <div className="p-3 bg-[#1C1F26] border border-[#1F222B] rounded-lg">
            <div className="font-bold text-yellow-400 mb-1">3. QA LAB INSPECTION</div>
            <p className="text-[11px] text-[#717684]">Inspector reviews surface finishes, tensile strengths & submits Pass/Fail reports.</p>
          </div>
          <div className="p-3 bg-[#1C1F26] border border-[#1F222B] rounded-lg">
            <div className="font-bold text-white mb-1">4. WAREHOUSE DTG</div>
            <p className="text-[11px] text-[#717684]">Passed inventory gets allocated physical rack coordinate variables, ready for machinery release.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

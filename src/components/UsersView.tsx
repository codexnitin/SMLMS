/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, Mail, Phone, Calendar, Key, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, UserMinus } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  onAddUser: (userData: Omit<User, 'id' | 'createdDate'>) => void;
  onModifyUser: (id: string, userData: Partial<Omit<User, 'id' | 'createdDate'>>) => void;
  onDeleteUser: (id: string) => void;
  currentUserId: string;
}

export default function UsersView({
  users,
  onAddUser,
  onModifyUser,
  onDeleteUser,
  currentUserId
}: UsersViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showModifyId, setShowModifyId] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Materials Management Unit',
    role: UserRole.MATERIAL_TEAM,
    password: ''
  });

  const [modifyForm, setModifyForm] = useState({
    name: '',
    phone: '',
    department: '',
    role: UserRole.VIEWER,
    password: ''
  });

  const [formError, setFormError] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const { name, email, role, password } = addForm;
    if (!name || !email || !role || !password) {
      setFormError('Name, official BHEL email, password, and authorization role are mandatory.');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setFormError('Email address is already registered in active directory.');
      return;
    }

    onAddUser({
      name,
      email,
      phone: addForm.phone,
      department: addForm.department,
      role: addForm.role,
      passwordHash: password
    });

    // Reset Form
    setAddForm({
      name: '',
      email: '',
      phone: '',
      department: 'Materials Management Unit',
      role: UserRole.MATERIAL_TEAM,
      password: ''
    });
    setShowAddForm(false);
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showModifyId) return;
    onModifyUser(showModifyId, {
      name: modifyForm.name,
      phone: modifyForm.phone,
      department: modifyForm.department,
      role: modifyForm.role,
      ...(modifyForm.password ? { passwordHash: modifyForm.password } : {})
    });
    setShowModifyId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Staff directory & Security Permissions
          </h2>
          <p className="text-xs text-[#717684]">Manage enterprise single-sign on credentials, assign JWT authentication scopes and enforce Role Checked rules.</p>
        </div>
        {!showAddForm && (
          <button
            id="register-operator-trigger"
            onClick={() => setShowAddForm(true)}
            className="bg-[#00D1FF] text-[#0A0B0E] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#00B8E0] transition-colors shadow-[0_0_12px_rgba(0,209,255,0.15)]"
          >
            + REGISTER NEW PLANT OPERATOR
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-[#111318] border border-[#1F222B] rounded-xl p-6 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between border-b border-[#1F222B] pb-3">
            <h3 className="text-sm font-bold text-white">Create Portal User</h3>
            <button 
              id="cancel-add-user-btn"
              onClick={() => { setShowAddForm(false); setFormError(''); }}
              className="text-[#717684] hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {formError && (
              <p className="text-red-400 font-semibold bg-red-400/5 border border-red-400/10 p-2.5 rounded-lg text-xs">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Full Name *</label>
                <input
                  id="user-form-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Official BHEL Email *</label>
                <input
                  id="user-form-email"
                  type="email"
                  required
                  placeholder="name@bhel.in"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Telephone Contract</label>
                <input
                  id="user-form-phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Division Department *</label>
                <select
                  id="user-form-department"
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                >
                  <option value="Materials Management Unit">Materials Management Unit</option>
                  <option value="Quality Assurance Division">Quality Assurance Division</option>
                  <option value="Transport & Gate (DTG) Storage">Transport & Gate (DTG) Storage</option>
                  <option value="Supervision & Planning Bureau">Supervision & Planning Bureau</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#717684]">Enterprise Scope Permission *</label>
                <select
                  id="user-form-role"
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                  className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                >
                  <option value={UserRole.ADMIN}>ADMIN (Full Control)</option>
                  <option value={UserRole.MATERIAL_TEAM}>MATERIAL TEAM (Arrival log)</option>
                  <option value={UserRole.QUALITY_TEAM}>QUALITY TEAM (Lab certs)</option>
                  <option value={UserRole.DTG_TEAM}>DTG TEAM (Stockyard dispatch)</option>
                  <option value={UserRole.VIEWER}>VIEWER (Read-Only)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-[#717684] flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-[#00D1FF]" /> Password Hash Encryption *
              </label>
              <input
                id="user-form-password"
                type="password"
                required
                placeholder="Secure access combination"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full bg-[#1C1F26] border border-[#2D313C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                id="cancel-add-user-btn-form"
                onClick={() => { setShowAddForm(false); setFormError(''); }}
                className="bg-transparent hover:bg-[#1C1F26] text-white border border-[#2D313C] px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-new-user-btn"
                className="bg-[#00D1FF] text-[#0A0B0E] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#00B8E0]"
              >
                Register Employee Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USERS TABLE */}
      <div className="bg-[#111318] border border-[#1F222B] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F1116] text-[#717684] font-bold uppercase border-b border-[#1F222B]">
              <tr>
                <th className="px-6 py-3">UserID / Employee</th>
                <th className="px-6 py-3">Official Email</th>
                <th className="px-6 py-3">Contract Contact</th>
                <th className="px-6 py-3">Associated Department</th>
                <th className="px-6 py-3">SSO Access Rights</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F222B]">
              {users.map((u) => {
                const getRoleStyle = (role: UserRole) => {
                  switch (role) {
                    case UserRole.ADMIN: return 'bg-red-400/10 text-red-400 border border-red-500/15';
                    case UserRole.MATERIAL_TEAM: return 'bg-blue-400/10 text-blue-400 border border-blue-500/15';
                    case UserRole.QUALITY_TEAM: return 'bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20';
                    case UserRole.DTG_TEAM: return 'bg-pink-400/10 text-pink-300 border border-pink-550/15';
                    default: return 'bg-stone-500/10 text-stone-400 border border-stone-500/20';
                  }
                };

                return (
                  <tr key={u.id} className="hover:bg-[#161920]/40 transition-colors">
                    {/* User profile details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1C1F26] border border-[#2D313C] flex items-center justify-center font-bold text-white text-[12px] uppercase">
                          {u.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white font-sans">{u.name}</p>
                          <p className="text-[9px] font-mono text-[#717684]">{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-stone-300">
                        <Mail className="w-3.5 h-3.5 text-[#525866]" />
                        {u.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#717684]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-[#525866]" />
                        {u.phone || 'NA'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-stone-300 font-medium">
                      {u.department}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${getRoleStyle(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {u.id !== currentUserId && (
                          <button
                            id={`purge-user-${u.id}`}
                            onClick={() => {
                              if (confirm(`Revoke SSO properties and purge employee profile ${u.name}?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1 text-red-400 hover:text-red-500 rounded hover:bg-red-500/10"
                            title="Revoke access rights"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

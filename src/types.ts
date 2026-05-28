/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  MATERIAL_TEAM = 'MATERIAL_TEAM',
  QUALITY_TEAM = 'QUALITY_TEAM',
  DTG_TEAM = 'DTG_TEAM',
  VIEWER = 'VIEWER'
}

export enum MaterialStatus {
  PENDING = 'PENDING', // Awaiting Gate Entry / Arrival confirmation
  ACCEPTED = 'ACCEPTED', // Accepted at gate, forwarded to Quality Team
  REJECTED = 'REJECTED', // Rejected at gate, returned to vendor (Closed)
  QUALITY_PASSED = 'QUALITY_PASSED', // Quality inspection passed, forwarded to DTG Team
  QUALITY_FAILED = 'QUALITY_FAILED', // Quality inspection failed, returned to vendor (Closed)
  IN_STOCK = 'IN_STOCK', // Received in DTG and added to inventory
  DISPATCHED = 'DISPATCHED' // Issued for heavy machinery production (Closed)
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole;
  passwordHash: string;
  createdDate: string;
}

export interface Material {
  id: string;          // Generates format e.g., BHEL-M-2026-X
  name: string;
  vendorName: string;
  vendorId: string;
  purchaseOrderNumber: string;
  quantity: number;
  unit: string;        // mT, Tonnes, Kgs, Units
  arrivalDate: string;
  vehicleNumber: string;
  invoiceNumber: string;
  description: string;
  currentLocation: string; // e.g. Gate 1, Inspection Bay A, Warehouse Zone C
  status: MaterialStatus;
  gateTeamRemarks?: string;
  rejectionReason?: string;
  timestamp: string;
  updatedBy: string;   // User ID or name
}

export interface QualityInspection {
  id: string;
  materialId: string;
  materialName: string;
  inspectorName: string;
  date: string;
  result: 'PASS' | 'FAIL';
  remarks: string;
  checklist: {
    dimensionsOk: boolean;
    tensileStrengthOk: boolean;
    materialGradeOk: boolean;
    surfaceFinishOk: boolean;
    chemicalCompositionOk: boolean;
  };
  defectCategory?: string;
  updatedBy: string;
}

export interface InventoryItem {
  id: string;
  materialId: string;
  materialName: string;
  warehouseLocation: string; // e.g., Zone-A-Bin-4
  quantityAvailable: number;
  quantityUsed: number;
  currentStock: number;
  lowStockThreshold: number;
  lastMovedDate: string;
  movementHistory: {
    date: string;
    type: 'ADD' | 'DISPATCH' | 'MOVE';
    quantity: number;
    destination: string;
    operator: string;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  timestamp: string;
  roleScope?: UserRole; // Read-scope permission
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;      // e.g. "Create Material Ticket", "Approve Gate Gate Receipt"
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface KPICards {
  totalMaterialsCount: number;
  acceptedGateCount: number;
  rejectedGateCount: number;
  pendingInspectionCount: number;
  inventoryTotalStock: number;
  lowStockCount: number;
}

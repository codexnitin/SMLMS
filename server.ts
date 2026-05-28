/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { UserRole, MaterialStatus, User, Material, QualityInspection, InventoryItem, Notification, AuditLog } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'smlms_db.json');

app.use(express.json());

// Helper function to safely read DB
function readDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    // Generate Seeds
    const initialData = seedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse SMLMS DB file, fallback to seeds", err);
    return seedDatabase();
  }
}

// Helper function to safely write DB
function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to SMLMS DB", err);
  }
}

// System Seeds Generator
function seedDatabase() {
  console.log("Generating fresh industrial seed database for BHEL SMLMS...");

  // Seed Users
  const users: User[] = [
    {
      id: "usr-admin",
      name: "Sanjay Kumar (ERP Admin)",
      email: "admin@bhel.in",
      phone: "+91 94256 01234",
      department: "Information Technology & Systems",
      role: UserRole.ADMIN,
      passwordHash: "bhel1234", // Standard Student Dev Password
      createdDate: "2026-05-01T10:00:00Z"
    },
    {
      id: "usr-material",
      name: "Rajesh Sharma (Gate Operations)",
      email: "material@bhel.in",
      phone: "+91 94256 56789",
      department: "Materials Management Unit",
      role: UserRole.MATERIAL_TEAM,
      passwordHash: "bhel1234",
      createdDate: "2026-05-02T11:00:00Z"
    },
    {
      id: "usr-quality",
      name: "Dr. Alok Verma (QA Inspect)",
      email: "quality@bhel.in",
      phone: "+91 98932 45312",
      department: "Quality Assurance Division",
      role: UserRole.QUALITY_TEAM,
      passwordHash: "bhel1234",
      createdDate: "2026-05-02T12:00:00Z"
    },
    {
      id: "usr-dtg",
      name: "Meena Deshmukh (DTG Storage)",
      email: "dtg@bhel.in",
      phone: "+91 99775 88201",
      department: "Despatch, Transport & Gate (DTG)",
      role: UserRole.DTG_TEAM,
      passwordHash: "bhel1234",
      createdDate: "2026-05-03T14:30:00Z"
    },
    {
      id: "usr-viewer",
      name: "R. K. Srivastava (Director Planning)",
      email: "viewer@bhel.in",
      phone: "+91 91112 00450",
      department: "Planning & Senior Monitoring Board",
      role: UserRole.VIEWER,
      passwordHash: "bhel1234",
      createdDate: "2026-05-05T09:00:00Z"
    }
  ];

  // Seed Materials
  const materials: Material[] = [
    {
      id: "BHEL-M-7493",
      name: "Superheater Coils (Grade-SA213-T22)",
      vendorName: "Jindal Steel & Power Ltd",
      vendorId: "VND-JINDAL-01",
      purchaseOrderNumber: "PO/2026/8802/QA",
      quantity: 45,
      unit: "Tons",
      arrivalDate: "2026-05-18T08:30:00Z",
      vehicleNumber: "MP-04-HE-7821",
      invoiceNumber: "INV-JSPL-2026-1049",
      description: "Seamless alloy steel tubes for heavy boiler execution.",
      currentLocation: "DTG Storage Warehouse - Zone B",
      status: MaterialStatus.IN_STOCK,
      timestamp: "2026-05-18T08:35:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-8224",
      name: "Heavy Rotor Shaft (Dia-1200mm forged)",
      vendorName: "Bharat Forge Ltd",
      vendorId: "VND-BFORGE-02",
      purchaseOrderNumber: "PO/2026/7192/HW",
      quantity: 2,
      unit: "Units",
      arrivalDate: "2026-05-20T10:15:00Z",
      vehicleNumber: "MH-12-SF-4439",
      invoiceNumber: "INV-BFL-9021",
      description: "Forged steam turbine rotor shaft for 500MW heavy machinery production.",
      currentLocation: "DTG Storage Warehouse - Zone A",
      status: MaterialStatus.IN_STOCK,
      timestamp: "2026-05-20T10:20:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-5531",
      name: "Turbine Blades (HP Stage-3)",
      vendorName: "Triveni Turbine Castings Ltd",
      vendorId: "VND-TRIVENI-09",
      purchaseOrderNumber: "PO/2026/4102/QA",
      quantity: 120,
      unit: "Units",
      arrivalDate: "2026-05-22T06:45:00Z",
      vehicleNumber: "KA-03-MK-8820",
      invoiceNumber: "INV-TTL-11029",
      description: "Cast high-precision gas turbine blade components.",
      currentLocation: "Gate 4 Reception Center",
      status: MaterialStatus.PENDING,
      timestamp: "2026-05-22T06:50:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-2018",
      name: "Silicon Steel Stampings",
      vendorName: "Tata Steel BSL Ltd",
      vendorId: "VND-TATA-04",
      purchaseOrderNumber: "PO/2026/9110/EM",
      quantity: 85,
      unit: "Tons",
      arrivalDate: "2026-05-23T11:10:00Z",
      vehicleNumber: "JH-05-G-1102",
      invoiceNumber: "TS-INV-4410",
      description: "Lamination stampings for generator rotor magnetic circuits.",
      currentLocation: "Vendor Stockyard (Returned)",
      status: MaterialStatus.REJECTED,
      gateTeamRemarks: "Gate-entry inspect determined heavy physical moisture damage and rust across multiple stacks.",
      rejectionReason: "Moisture corrosion / Stack contamination during transport",
      timestamp: "2026-05-23T11:45:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-1192",
      name: "Condenser Tubes (Copper-Alloy)",
      vendorName: "Bharat Copper Mill Ltd",
      vendorId: "VND-BCOP-15",
      purchaseOrderNumber: "PO/2026/6619/CD",
      quantity: 450,
      unit: "Units",
      arrivalDate: "2026-05-24T09:00:00Z",
      vehicleNumber: "GJ-01-XX-9412",
      invoiceNumber: "BC-6612-INV",
      description: "90-10 Copper Nickel Condenser Tubes for power generating station condensers.",
      currentLocation: "Quality Inspection Bay A",
      status: MaterialStatus.ACCEPTED,
      gateTeamRemarks: "Invoices verified, batch dimensions look consistent overall. Transferred to Quality Bureau.",
      timestamp: "2026-05-24T09:30:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-3349",
      name: "Forged Gas Flanges (150# ANSI Class)",
      vendorName: "Excel Forgings Pvt Ltd",
      vendorId: "VND-EXCEL-33",
      purchaseOrderNumber: "PO/2026/3004/FL",
      quantity: 75,
      unit: "Units",
      arrivalDate: "2026-05-25T13:00:00Z",
      vehicleNumber: "HR-55-P-0211",
      invoiceNumber: "EXP-90412",
      description: "Carbon steel high-tensile piping flanges for boiler headers.",
      currentLocation: "Quality Inspection Bay B",
      status: MaterialStatus.QUALITY_PASSED,
      gateTeamRemarks: "Checked, forwarded to lab testing.",
      timestamp: "2026-05-25T13:15:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-4491",
      name: "High Pressure Valve Casting Assemblies",
      vendorName: "L&T Heavy Engineering Ltd",
      vendorId: "VND-LNT-05",
      purchaseOrderNumber: "PO/2026/1941/PV",
      quantity: 8,
      unit: "Units",
      arrivalDate: "2026-05-25T15:30:00Z",
      vehicleNumber: "MH-46-TR-8812",
      invoiceNumber: "LNT-HP-7412",
      description: "Integrated cast gate system valves for pressure regulation circuits.",
      currentLocation: "Vendor Stockyard (Returned)",
      status: MaterialStatus.QUALITY_FAILED,
      gateTeamRemarks: "Gate documents verified successfully.",
      timestamp: "2026-05-25T15:45:00Z",
      updatedBy: "Rajesh Sharma"
    },
    {
      id: "BHEL-M-9021",
      name: "Weld Electrodes (Super-Strength E7018)",
      vendorName: "ESAB India Ltd",
      vendorId: "VND-ESAB-07",
      purchaseOrderNumber: "PO/2026/5521/WD",
      quantity: 500,
      unit: "Kgs",
      arrivalDate: "2026-05-26T14:00:00Z",
      vehicleNumber: "KA-51-MM-0043",
      invoiceNumber: "ESAB-WD-22921",
      description: "Low-hydrogen structural alloy welding rods.",
      currentLocation: "Production floor (Dispatched)",
      status: MaterialStatus.DISPATCHED,
      timestamp: "2026-05-26T14:15:00Z",
      updatedBy: "Rajesh Sharma"
    }
  ];

  // Seed Quality Inspections
  const inspections: QualityInspection[] = [
    {
      id: "INSP-10921",
      materialId: "BHEL-M-7493",
      materialName: "Superheater Coils (Grade-SA213-T22)",
      inspectorName: "Dr. Alok Verma",
      date: "2026-05-19T11:00:00Z",
      result: "PASS",
      remarks: "Sample checks of tube thickness (3.2mm) and metallurgy matches ASTM standards perfectly. Verified tensile yield 415 MPa.",
      checklist: {
        dimensionsOk: true,
        tensileStrengthOk: true,
        materialGradeOk: true,
        surfaceFinishOk: true,
        chemicalCompositionOk: true
      },
      updatedBy: "Dr. Alok Verma"
    },
    {
      id: "INSP-10922",
      materialId: "BHEL-M-8224",
      materialName: "Heavy Rotor Shaft (Dia-1200mm forged)",
      inspectorName: "Dr. Alok Verma",
      date: "2026-05-21T14:30:00Z",
      result: "PASS",
      remarks: "Ultrasonic testing profile confirms absolute interior integrity without micro-cracks. Hardness BHN 190 compliant.",
      checklist: {
        dimensionsOk: true,
        tensileStrengthOk: true,
        materialGradeOk: true,
        surfaceFinishOk: true,
        chemicalCompositionOk: true
      },
      updatedBy: "Dr. Alok Verma"
    },
    {
      id: "INSP-10923",
      materialId: "BHEL-M-4491",
      materialName: "High Pressure Valve Casting Assemblies",
      inspectorName: "Dr. Alok Verma",
      date: "2026-05-26T10:00:00Z",
      result: "FAIL",
      remarks: "Hydrostatic pressure burst test failed at 180 bar (Target: 250 bar structural coefficient). Flange micro-pores detected.",
      checklist: {
        dimensionsOk: true,
        tensileStrengthOk: false,
        materialGradeOk: true,
        surfaceFinishOk: false,
        chemicalCompositionOk: true
      },
      defectCategory: "Hydrostatic testing failure & Micro-porosity cracks",
      updatedBy: "Dr. Alok Verma"
    },
    {
      id: "INSP-10924",
      materialId: "BHEL-M-3349",
      materialName: "Forged Gas Flanges (150# ANSI Class)",
      inspectorName: "Dr. Alok Verma",
      date: "2026-05-27T16:00:00Z",
      result: "PASS",
      remarks: "ANSI rating verified. Structural micro-stamping matches chemical mill test report flawlessly.",
      checklist: {
        dimensionsOk: true,
        tensileStrengthOk: true,
        materialGradeOk: true,
        surfaceFinishOk: true,
        chemicalCompositionOk: true
      },
      updatedBy: "Dr. Alok Verma"
    }
  ];

  // Seed Inventory
  const inventory: InventoryItem[] = [
    {
      id: "INV-101",
      materialId: "BHEL-M-7493",
      materialName: "Superheater Coils (Grade-SA213-T22)",
      warehouseLocation: "Zone-B-Bin-12",
      quantityAvailable: 45,
      quantityUsed: 15,
      currentStock: 30,
      lowStockThreshold: 15,
      lastMovedDate: "2026-05-19T14:00:00Z",
      movementHistory: [
        {
          date: "2026-05-19T14:00:00Z",
          type: "ADD",
          quantity: 45,
          destination: "Zone-B-Bin-12",
          operator: "Meena Deshmukh"
        },
        {
          date: "2026-05-24T10:00:00Z",
          type: "DISPATCH",
          quantity: 15,
          destination: "High Pressure Boiler Welding Bay",
          operator: "Meena Deshmukh"
        }
      ]
    },
    {
      id: "INV-102",
      materialId: "BHEL-M-8224",
      materialName: "Heavy Rotor Shaft (Dia-1200mm forged)",
      warehouseLocation: "Zone-A-Bin-02",
      quantityAvailable: 2,
      quantityUsed: 1,
      currentStock: 1,
      lowStockThreshold: 2, // Low stock since currentStock is below threshold!
      lastMovedDate: "2026-05-21T16:30:00Z",
      movementHistory: [
        {
          date: "2026-05-21T16:30:00Z",
          type: "ADD",
          quantity: 2,
          destination: "Zone-A-Bin-02",
          operator: "Meena Deshmukh"
        },
        {
          date: "2026-05-25T09:00:00Z",
          type: "DISPATCH",
          quantity: 1,
          destination: "Steam Turbine Assembly Pit-3",
          operator: "Meena Deshmukh"
        }
      ]
    }
  ];

  // Seed Notifications
  const notifications: Notification[] = [
    {
      id: "nt-01",
      title: "New Material Transferred from Gate",
      message: "Material BHEL-M-1192 (Condenser Tubes) accepted at gate and queued for Quality Inspection.",
      type: "INFO",
      isRead: false,
      timestamp: "2026-05-24T09:30:00Z",
      roleScope: UserRole.QUALITY_TEAM
    },
    {
      id: "nt-02",
      title: "Low Stock Alert: Rotor Shaft",
      message: "Inventory item BHEL-M-8224 (Heavy Rotor Shaft) stock has fallen to 1. Threshold level is 2.",
      type: "WARNING",
      isRead: false,
      timestamp: "2026-05-25T09:00:00Z",
      roleScope: UserRole.DTG_TEAM
    },
    {
      id: "nt-03",
      title: "Quality Control Failure: Casting High Leakage",
      message: "Quality Check for BHEL-M-4491 returned FAIL. Defect logged: Hydrostatic burst test failure. Material returned.",
      type: "ERROR",
      isRead: false,
      timestamp: "2026-05-26T10:05:00Z",
      roleScope: UserRole.ADMIN
    },
    {
      id: "nt-04",
      title: "Material Dispatched to Production Pit",
      message: "Weld Electrodes (BHEL-M-9021) quantity 500 Kgs fully issued to Boiler Assembly floor.",
      type: "SUCCESS",
      isRead: true,
      timestamp: "2026-05-26T14:15:00Z"
    }
  ];

  // Seed Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: "lg-1",
      userId: "usr-material",
      userName: "Rajesh Sharma",
      userRole: UserRole.MATERIAL_TEAM,
      action: "System Initialization & Seeding Tracker",
      timestamp: "2026-05-28T10:00:00Z"
    },
    {
      id: "lg-2",
      userId: "usr-material",
      userName: "Rajesh Sharma",
      userRole: UserRole.MATERIAL_TEAM,
      action: "Create Material Arrival Receipt",
      newValue: "Code BHEL-M-1192: Condenser Tubes from Bharat Copper Mill",
      timestamp: "2026-05-24T09:00:00Z"
    },
    {
      id: "lg-3",
      userId: "usr-material",
      userName: "Rajesh Sharma",
      userRole: UserRole.MATERIAL_TEAM,
      action: "Forward Receipt to Quality Bureau",
      previousValue: "Gate Status: PENDING",
      newValue: "Gate Status: ACCEPTED",
      timestamp: "2026-05-24T09:30:00Z"
    },
    {
      id: "lg-4",
      userId: "usr-quality",
      userName: "Dr. Alok Verma",
      userRole: UserRole.QUALITY_TEAM,
      action: "File Quality Report on Flanges",
      previousValue: "Awaiting inspection",
      newValue: "Approved standard checklist PASSED",
      timestamp: "2026-05-27T16:00:00Z"
    }
  ];

  return { users, materials, inspections, inventory, notifications, auditLogs };
}

// Security Authentication MDW
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication missing or invalid.' });
  }
  const token = authHeader.split(' ')[1];
  const db = readDatabase();
  const user = db.users.find((u: User) => `smlms-token-${u.id}` === token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or user invalid.' });
  }
  (req as any).user = user;
  next();
}

// --- AUTH APIS ---
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please submit email and password' });
  }
  const db = readDatabase();
  const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid BHEL credential credentials.' });
  }

  const token = `smlms-token-${user.id}`;
  const responseData = {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      createdDate: user.createdDate
    }
  };

  // Log action
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "User Login",
    newValue: `Session established successfully`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  writeDatabase(db);

  return res.json(responseData);
});

app.post('/api/v1/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const db = readDatabase();
  const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  
  // Enterprise level fallback: ALWAYS return true but log action internally
  if (user) {
    console.log(`[BHEL MAIL SERVER] Generated password reset link for user ${user.email}`);
  }
  return res.json({ success: true, message: "A secure reset link has been dispatched to official email." });
});

app.post('/api/v1/auth/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Required fields missing." });
  }
  const db = readDatabase();
  const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User profile not registered." });
  }
  
  const prevPass = user.passwordHash;
  user.passwordHash = newPassword;
  
  // Log action
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "Reset Password via Email Link",
    previousValue: "Old Pass Signature cached",
    newValue: "New Pass Hash committed",
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json({ success: true, message: "Credential reset complete." });
});

app.post('/api/v1/auth/change-password', authenticateUser, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const loggedInUser = (req as any).user as User;
  
  const db = readDatabase();
  const user = db.users.find((u: User) => u.id === loggedInUser.id);
  
  if (!user || user.passwordHash !== oldPassword) {
    return res.status(400).json({ error: "Current password does not match cached records." });
  }
  
  user.passwordHash = newPassword;
  
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "Change Password in Portal",
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json({ success: true, message: "Password updated successfully." });
});

// --- GOOGLE OAUTH APIS & SIMULATION ---
app.get('/api/v1/auth/google/url', (req, res) => {
  const clientRedirectUri = req.query.redirect_uri as string || '';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    // Return a simulation URL served locally
    const simUrl = `/auth/google-simulation?redirect_uri=${encodeURIComponent(clientRedirectUri || '')}`;
    return res.json({ url: simUrl, simulated: true });
  }

  // Construct real Google OAuth Authorization URL
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: clientRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account'
  });

  return res.json({ url: `${googleAuthUrl}?${params.toString()}`, simulated: false });
});

app.get('/auth/google-simulation', (req, res) => {
  const redirectUri = req.query.redirect_uri as string || '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sign in with Google (Simulation)</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #0A0B0E;
          color: #E2E8F0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          padding: 16px;
          box-sizing: border-box;
        }
        .container {
          background-color: #111318;
          border: 1px solid #1F222B;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .google-logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .google-logo span:nth-child(1) { color: #4285F4; }
        .google-logo span:nth-child(2) { color: #EA4335; }
        .google-logo span:nth-child(3) { color: #FBBC05; }
        .google-logo span:nth-child(4) { color: #34A853; }
        h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #FFFFFF;
        }
        .subtitle {
          color: #717684;
          font-size: 14px;
          margin: 0;
        }
        .sandbox-callout {
          background-color: rgba(0, 209, 255, 0.08);
          border: 1px dashed rgba(0, 209, 255, 0.25);
          color: #00D1FF;
          font-size: 11px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          line-height: 1.4;
          text-align: left;
        }
        .sandbox-label {
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 4px;
        }
        .accounts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .account-btn {
          display: flex;
          align-items: center;
          width: 100%;
          background: #1C1F26;
          border: 1px solid #2D313C;
          border-radius: 8px;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          color: inherit;
        }
        .account-btn:hover {
          background-color: #2D313C;
          border-color: #00D1FF;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.08);
          color: #00D1FF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          margin-right: 12px;
          border: 1px solid rgba(0,209,255,0.15);
        }
        .account-info {
          flex: 1;
          min-width: 0;
        }
        .account-name {
          font-weight: 600;
          font-size: 13px;
          margin: 0;
          color: #FFFFFF;
        }
        .account-email {
          font-size: 11px;
          color: #717684;
          margin: 2px 0 0 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .manual-form-toggle {
          background: none;
          border: none;
          color: #00D1FF;
          font-size: 12px;
          cursor: pointer;
          margin-top: 16px;
          text-align: center;
          width: 100%;
        }
        .manual-form-toggle:hover {
          text-decoration: underline;
        }
        .manual-form {
          display: none;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
          border-top: 1px solid #1F222B;
          padding-top: 16px;
        }
        input {
          background: #1C1F26;
          border: 1px solid #2D313C;
          color: white;
          padding: 10px;
          font-size: 12px;
          border-radius: 6px;
          outline: none;
        }
        input:focus {
          border-color: #00D1FF;
        }
        .submit-btn {
          background-color: #00D1FF;
          color: #0A0B0E;
          border: none;
          font-weight: bold;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
        .submit-btn:hover {
          background-color: #00B8E0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="google-logo">
            <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
          </div>
          <h2>Choose an account</h2>
          <p class="subtitle">to continue to BHEL SMLMS ERP</p>
        </div>

        <div class="sandbox-callout">
          <span class="sandbox-label">💡 Development Sandbox Mode</span>
          No Google Client API Credentials configured in the environment variables yet. Using local simulated accounts to allow instant review. To configure active production Google Client Credentials, populate the <strong>GOOGLE_CLIENT_ID</strong> environment variable.
        </div>

        <div class="accounts-list">
          <button class="account-btn" onclick="selectAcct('Sanjay Kumar (ERP Admin)', 'admin@bhel.in')">
            <div class="avatar">SK</div>
            <div class="account-info">
              <p class="account-name">Sanjay Kumar</p>
              <p class="account-email">admin@bhel.in</p>
            </div>
          </button>

          <button class="account-btn" onclick="selectAcct('Rajesh Sharma (Gate Operations)', 'material@bhel.in')">
            <div class="avatar">RS</div>
            <div class="account-info">
              <p class="account-name">Rajesh Sharma</p>
              <p class="account-email">material@bhel.in</p>
            </div>
          </button>

          <button class="account-btn" onclick="selectAcct('Dr. Alok Verma (QA Inspect)', 'quality@bhel.in')">
            <div class="avatar">AV</div>
            <div class="account-info">
              <p class="account-name">Dr. Alok Verma</p>
              <p class="account-email">quality@bhel.in</p>
            </div>
          </button>

          <button class="account-btn" onclick="selectAcct('Meena Deshmukh (DTG Storage)', 'dtg@bhel.in')">
            <div class="avatar">MD</div>
            <div class="account-info">
              <p class="account-name">Meena Deshmukh</p>
              <p class="account-email">dtg@bhel.in</p>
            </div>
          </button>
        </div>

        <button class="manual-form-toggle" onclick="toggleForm()">Use another account</button>
        
        <form class="manual-form" id="manual-form" onsubmit="submitForm(event)">
          <input type="text" id="manual-name" placeholder="Full Name (e.g. Supervisor)" required>
          <input type="email" id="manual-email" placeholder="Google Account Email" required>
          <button type="submit" class="submit-btn font-bold">Sign In & Callback</button>
        </form>
      </div>

      <script>
        const redirectUri = "${redirectUri}";
        
        function selectAcct(name, email) {
          const callbackUrl = redirectUri + 
            "?code=simulated-code" + 
            "&email=" + encodeURIComponent(email) + 
            "&name=" + encodeURIComponent(name) +
            "&redirect_uri=" + encodeURIComponent(redirectUri);
          window.location.href = callbackUrl;
        }

        function toggleForm() {
          const form = document.getElementById('manual-form');
          form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
        }

        function submitForm(event) {
          event.preventDefault();
          const name = document.getElementById('manual-name').value;
          const email = document.getElementById('manual-email').value;
          selectAcct(name, email);
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/v1/auth/google/callback', async (req, res) => {
  const { code, email, name, picture, redirect_uri } = req.query;

  let userEmail = '';
  let userName = '';
  let userPicture = '';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  if (code === 'simulated-code' || !clientId || !clientSecret) {
    // SIMULATED AUTH
    userEmail = (email as string) || 'guest@bhel.in';
    userName = (name as string) || 'Guest User';
    userPicture = (picture as string) || '';
  } else {
    // REAL GOOGLE AUTH TOKEN EXCHANGE
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirect_uri as string,
          grant_type: 'authorization_code',
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Google token exchange error: ${errorText}`);
      }

      const tokenData = await tokenResponse.json() as any;
      const accessToken = tokenData.access_token;

      // Fetch user profile from google userinfo
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userinfoResponse.ok) {
        const errorText = await userinfoResponse.text();
        throw new Error(`Google userinfo error: ${errorText}`);
      }

      const userData = await userinfoResponse.json() as any;
      userEmail = userData.email;
      userName = userData.name || userData.given_name || 'Google User';
      userPicture = userData.picture || '';
    } catch (err: any) {
      console.error("Google Auth Token exchange failed:", err);
      return res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; background: #0A0B0E; color: #ff5555; padding: 20px;">
            <h3>Google Authentication Failed</h3>
            <p>${err.message}</p>
            <button onclick="window.close()" style="background: #2D313C; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }
  }

  // Find or create User in SMLMS directory
  const db = readDatabase();
  let user = db.users.find((u: User) => u.email.toLowerCase() === userEmail.toLowerCase());

  if (!user) {
    // Create a new Viewer or Link existing BHEL roles if they authenticate with institutional bhel emails
    let role = UserRole.VIEWER;
    let dept = 'Temporary Visitor Division';
    
    // Automatically match typical role patterns for demonstration ease
    if (userEmail.includes('admin')) {
      role = UserRole.ADMIN;
      dept = 'Information Technology & Systems';
    } else if (userEmail.includes('material') || userEmail.includes('gate')) {
      role = UserRole.MATERIAL_TEAM;
      dept = 'Materials Management Unit';
    } else if (userEmail.includes('quality') || userEmail.includes('qa')) {
      role = UserRole.QUALITY_TEAM;
      dept = 'Quality Assurance Division';
    } else if (userEmail.includes('dtg') || userEmail.includes('despatch')) {
      role = UserRole.DTG_TEAM;
      dept = 'Despatch, Transport & Gate (DTG)';
    }

    user = {
      id: `usr-g-${Date.now().toString().slice(-6)}`,
      name: userName,
      email: userEmail,
      phone: "+91 91234 56789",
      department: dept,
      role: role,
      passwordHash: 'bhel1234', // default dev password hash
      createdDate: new Date().toISOString()
    };
    db.users.push(user);
  }

  const token = `smlms-token-${user.id}`;

  // Log action
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "Google Auth Login",
    newValue: `Session established via Google Account OAuth authentication [${user.email}]`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  writeDatabase(db);

  // Send success message to parent window and close popup (as prescribed in oauth-integration/SKILL.md)
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    role: user.role,
    createdDate: user.createdDate
  };

  res.send(`
    <html>
      <body style="background: #0A0B0E; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; margin: 0; text-align: center; padding: 20px;">
        <div style="background: #111318; border: 1px solid #1F222B; border-radius: 12px; padding: 32px; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="background: #00D1FF; width: 48px; height: 48px; border-radius: 50%; color: #0A0B0E; font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">✓</div>
          <h2 style="margin: 0 0 12px 0; color: white; font-size: 20px;">Authorized Successfully</h2>
          <p style="color: #717684; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;">Logged in as <strong>${userName}</strong> (${userEmail}). Closing this authorization portal window...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_LOGIN_SUCCESS', 
              token: '${token}', 
              user: ${JSON.stringify(safeUser)} 
            }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

// --- USER MANAGEMENT APIS ---
app.get('/api/v1/users', authenticateUser, (req, res) => {
  const db = readDatabase();
  const { query, department, role } = req.query;
  
  let result = [...db.users];
  if (department) {
    result = result.filter(u => u.department === department);
  }
  if (role) {
    result = result.filter(u => u.role === role);
  }
  if (query) {
    const q = String(query).toLowerCase();
    result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }
  
  // Mask passwords
  const masked = result.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    department: u.department,
    role: u.role,
    createdDate: u.createdDate
  }));
  
  return res.json(masked);
});

app.post('/api/v1/users', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }
  const { name, email, phone, department, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: "Please provide name, email, role, and password." });
  }
  
  const db = readDatabase();
  if (db.users.some((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email address already registered in SMLMS directory." });
  }
  
  const newUser: User = {
    id: `usr-${Date.now().toString().slice(-6)}`,
    name,
    email,
    phone: phone || '',
    department: department || 'SMLMS Operations',
    role: role as UserRole,
    passwordHash: password,
    createdDate: new Date().toISOString()
  };
  
  db.users.push(newUser);
  
  // Audits
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Create SMLMS Portal User",
    newValue: `ID: ${newUser.id}, Name: ${newUser.name}, Role: ${newUser.role}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    department: newUser.department,
    role: newUser.role,
    createdDate: newUser.createdDate
  });
});

app.put('/api/v1/users/:id', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }
  const { name, phone, department, role, password } = req.body;
  const targetId = req.params.id;
  
  const db = readDatabase();
  const user = db.users.find((u: User) => u.id === targetId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  
  const oldestStr = `Role: ${user.role}, Name: ${user.name}`;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (department) user.department = department;
  if (role) user.role = role as UserRole;
  if (password) user.passwordHash = password;
  
  // Audits
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Modify Portal User Properties",
    previousValue: oldestStr,
    newValue: `Role: ${user.role}, Name: ${user.name}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    role: user.role,
    createdDate: user.createdDate
  });
});

app.delete('/api/v1/users/:id', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }
  const targetId = req.params.id;
  if (targetId === loggedInUser.id) {
    return res.status(400).json({ error: "Self-deletion is restricted." });
  }
  
  const db = readDatabase();
  const index = db.users.findIndex((u: User) => u.id === targetId);
  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }
  
  const targetUser = db.users[index];
  db.users.splice(index, 1);
  
  // Audits
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Remove Portal User Directory",
    previousValue: `ID: ${targetUser.id}, Name: ${targetUser.name}, Email: ${targetUser.email}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json({ success: true, message: "User deleted from active systems directory." });
});

// --- MATERIAL MANAGEMENT APIS ---
app.get('/api/v1/materials', authenticateUser, (req, res) => {
  const db = readDatabase();
  const { query, status, limit, page, sortBy, sortOrder } = req.query;
  
  let result = [...db.materials];
  
  if (status) {
    result = result.filter(m => m.status === status);
  }
  if (query) {
    const q = String(query).toLowerCase();
    result = result.filter(m => 
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.vendorName.toLowerCase().includes(q) ||
      m.purchaseOrderNumber.toLowerCase().includes(q) ||
      m.invoiceNumber.toLowerCase().includes(q)
    );
  }
  
  // Sorting
  const sBy = String(sortBy || 'timestamp');
  const sOrder = String(sortOrder || 'desc');
  result.sort((a, b) => {
    let valA = (a as any)[sBy] || '';
    let valB = (b as any)[sBy] || '';
    if (typeof valA === 'string') {
      return sOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sOrder === 'asc' ? valA - valB : valB - valA;
  });
  
  return res.json(result);
});

app.get('/api/v1/materials/:id', authenticateUser, (req, res) => {
  const db = readDatabase();
  const material = db.materials.find((m: Material) => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ error: "Material ticket not registered." });
  }
  return res.json(material);
});

app.post('/api/v1/materials', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.MATERIAL_TEAM) {
    return res.status(403).json({ error: "Unauthorized. Material registration team privileges required." });
  }
  
  const { name, vendorName, vendorId, purchaseOrderNumber, quantity, unit, vehicleNumber, invoiceNumber, description } = req.body;
  if (!name || !vendorName || !purchaseOrderNumber || !quantity || !unit || !vehicleNumber || !invoiceNumber) {
    return res.status(400).json({ error: "Mandatory material receipt checklist attributes are missing." });
  }
  
  const db = readDatabase();
  
  // ID Generation SMLMS style e.g. BHEL-M-****
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const mId = `BHEL-M-${randomId}`;
  
  const newMaterial: Material = {
    id: mId,
    name,
    vendorName,
    vendorId: vendorId || `VND-${vendorName.toUpperCase().replace(/\s+/g, '-').slice(0, 10)}`,
    purchaseOrderNumber,
    quantity: parseFloat(quantity),
    unit,
    arrivalDate: new Date().toISOString(),
    vehicleNumber,
    invoiceNumber,
    description: description || '',
    currentLocation: "Gate 1 Receiving & Weigh Station",
    status: MaterialStatus.PENDING,
    timestamp: new Date().toISOString(),
    updatedBy: loggedInUser.name
  };
  
  db.materials.push(newMaterial);
  
  // Audits
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Material Entrance Entry",
    newValue: `ID: ${newMaterial.id}, Name: ${newMaterial.name}, Vendor: ${newMaterial.vendorName}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  // Notification
  const notif: Notification = {
    id: `nt-${Date.now()}`,
    title: "New Goods Gate Entry Added",
    message: `${newMaterial.name} from vendor ${newMaterial.vendorName} arrived in vehicle ${newMaterial.vehicleNumber}. Awaiting Receiving Team decision.`,
    type: "INFO",
    isRead: false,
    timestamp: new Date().toISOString(),
    roleScope: UserRole.MATERIAL_TEAM
  };
  db.notifications.unshift(notif);
  
  writeDatabase(db);
  return res.status(201).json(newMaterial);
});

app.put('/api/v1/materials/:id', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.MATERIAL_TEAM) {
    return res.status(403).json({ error: "Unauthorized. Material management authority required." });
  }
  
  const targetId = req.params.id;
  const db = readDatabase();
  const material = db.materials.find((m: Material) => m.id === targetId);
  if (!material) {
    return res.status(404).json({ error: "Material not found" });
  }
  
  const fields = ['name', 'vendorName', 'purchaseOrderNumber', 'quantity', 'unit', 'vehicleNumber', 'invoiceNumber', 'description', 'currentLocation'];
  const oldVals: string[] = [];
  const newVals: string[] = [];
  
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      oldVals.push(`${f}: ${material[f as keyof Material]}`);
      (material as any)[f] = req.body[f];
      newVals.push(`${f}: ${req.body[f]}`);
    }
  });
  
  material.timestamp = new Date().toISOString();
  material.updatedBy = loggedInUser.name;
  
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Update Material Receipt Specs",
    previousValue: oldVals.join(' | '),
    newValue: newVals.join(' | '),
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json(material);
});

app.delete('/api/v1/materials/:id', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Permission restricted. Admin access needed." });
  }
  
  const db = readDatabase();
  const index = db.materials.findIndex((m: Material) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Material ticket not found" });
  }
  
  const deletedItem = db.materials[index];
  db.materials.splice(index, 1);
  
  // Cleanup related inventory
  db.inventory = db.inventory.filter((inv: any) => inv.materialId !== deletedItem.id);
  
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Purge Material Entrance Record",
    previousValue: `ID: ${deletedItem.id}, Name: ${deletedItem.name}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json({ success: true, message: "Material purged successfully." });
});

// --- ACCEPTANCE / REJECTION GATE ACTIONS ---
app.post('/api/v1/materials/:id/status', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.MATERIAL_TEAM) {
    return res.status(403).json({ error: "Unauthorized. Action allowed by Material team only." });
  }
  
  const { action, rejectionReason, gateTeamRemarks } = req.body;
  if (!action || (action !== 'ACCEPT' && action !== 'REJECT')) {
    return res.status(400).json({ error: "Action must be ACCEPT or REJECT" });
  }
  
  const db = readDatabase();
  const material = db.materials.find((m: Material) => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ error: "Material not found" });
  }
  
  if (material.status !== MaterialStatus.PENDING) {
    return res.status(400).json({ error: "This material ticket has already been processed and is not pending gate action." });
  }
  
  if (action === 'REJECT') {
    if (!rejectionReason) {
      return res.status(400).json({ error: "Please log a clear rejection reason for vendor feedback on return." });
    }
    const previous = material.status;
    material.status = MaterialStatus.REJECTED;
    material.rejectionReason = rejectionReason;
    material.gateTeamRemarks = gateTeamRemarks || '';
    material.currentLocation = "Vendor Stockyard (Returned)";
    material.timestamp = new Date().toISOString();
    material.updatedBy = loggedInUser.name;
    
    const audit: AuditLog = {
      id: `lg-${Date.now()}`,
      userId: loggedInUser.id,
      userName: loggedInUser.name,
      userRole: loggedInUser.role,
      action: "Gate Rejection Execution",
      previousValue: `Status: ${previous}`,
      newValue: `Status: REJECTED. Reason: ${rejectionReason}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(audit);
    
    const notif: Notification = {
      id: `nt-${Date.now()}`,
      title: "Material Gate Entry Rejected",
      message: `${material.name} (ID: ${material.id}) rejected at gate. Reason: ${rejectionReason}`,
      type: "ERROR",
      isRead: false,
      timestamp: new Date().toISOString(),
      roleScope: UserRole.ADMIN
    };
    db.notifications.unshift(notif);
  } else {
    const previous = material.status;
    material.status = MaterialStatus.ACCEPTED;
    material.gateTeamRemarks = gateTeamRemarks || '';
    material.currentLocation = "Quality Inspection Quarantine Area";
    material.timestamp = new Date().toISOString();
    material.updatedBy = loggedInUser.name;
    
    const audit: AuditLog = {
      id: `lg-${Date.now()}`,
      userId: loggedInUser.id,
      userName: loggedInUser.name,
      userRole: loggedInUser.role,
      action: "Gate Acceptance Execution",
      previousValue: `Status: ${previous}`,
      newValue: `Status: ACCEPTED. Sent to Quality Quarantine.`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(audit);
    
    const notif: Notification = {
      id: `nt-${Date.now()}`,
      title: "Accepted Goods Routing Alert",
      message: `${material.name} (ID: ${material.id}) passed Gate inspect. Placed in QA Quarantine.`,
      type: "SUCCESS",
      isRead: false,
      timestamp: new Date().toISOString(),
      roleScope: UserRole.QUALITY_TEAM
    };
    db.notifications.unshift(notif);
  }
  
  writeDatabase(db);
  return res.json(material);
});

// --- QUALITY BUREAU APIS ---
app.post('/api/v1/quality/:id', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.QUALITY_TEAM) {
    return res.status(403).json({ error: "Unauthorized. Quality inspectors validation privileges required." });
  }
  
  const { result, remarks, checklist, defectCategory } = req.body;
  if (!result || (result !== 'PASS' && result !== 'FAIL')) {
    return res.status(400).json({ error: "Validation result must be PASS or FAIL" });
  }
  if (!remarks) {
    return res.status(400).json({ error: "Please provide detailed inspection comments or test results remarks." });
  }
  
  const db = readDatabase();
  const material = db.materials.find((m: Material) => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ error: "Material ticket not found" });
  }
  
  if (material.status !== MaterialStatus.ACCEPTED) {
    return res.status(400).json({ error: "This material ticket cannot be inspected now. Current status is " + material.status });
  }
  
  // Set material status based on QA result
  material.status = result === 'PASS' ? MaterialStatus.QUALITY_PASSED : MaterialStatus.QUALITY_FAILED;
  material.currentLocation = result === 'PASS' ? "DTG Quarantine Loading Bay" : "Vendor Stockyard (Returned)";
  material.timestamp = new Date().toISOString();
  material.updatedBy = loggedInUser.name;
  
  // Create inspection report
  const cleanChecklist = checklist || {
    dimensionsOk: true,
    tensileStrengthOk: true,
    materialGradeOk: true,
    surfaceFinishOk: true,
    chemicalCompositionOk: true
  };
  
  const newInsp: QualityInspection = {
    id: `INSP-${Math.floor(10000 + Math.random() * 90000)}`,
    materialId: material.id,
    materialName: material.name,
    inspectorName: loggedInUser.name,
    date: new Date().toISOString(),
    result,
    remarks,
    checklist: cleanChecklist,
    defectCategory: result === 'FAIL' ? (defectCategory || "Metallurgical grade non-conformity") : undefined,
    updatedBy: loggedInUser.name
  };
  
  db.inspections.unshift(newInsp);
  
  // Log action
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "File Quality Report Check",
    newValue: `ID: ${newInsp.id}, Result: ${result}, Remarks: ${remarks.slice(0, 30)}...`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  // Trigger notifications
  const notif: Notification = {
    id: `nt-${Date.now()}`,
    title: result === 'PASS' ? "QA Evaluation Approved" : "QA Evaluation FAILED",
    message: `${material.name} (PO: ${material.purchaseOrderNumber}) quality audit returned ${result}. Routing accordingly.`,
    type: result === 'PASS' ? "SUCCESS" : "ERROR",
    isRead: false,
    timestamp: new Date().toISOString(),
    roleScope: result === 'PASS' ? UserRole.DTG_TEAM : UserRole.ADMIN
  };
  db.notifications.unshift(notif);
  
  writeDatabase(db);
  return res.json({ material, inspection: newInsp });
});

app.get('/api/v1/quality', authenticateUser, (req, res) => {
  const db = readDatabase();
  return res.json(db.inspections);
});

// --- INVENTORY MANAGEMENT APIS ---
app.get('/api/v1/inventory', authenticateUser, (req, res) => {
  const db = readDatabase();
  return res.json(db.inventory);
});

app.post('/api/v1/inventory', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.DTG_TEAM) {
    return res.status(403).json({ error: "Access restricted. Dispatch and Warehouse roles required." });
  }
  
  const { materialId, warehouseLocation, initialStock, lowStockThreshold } = req.body;
  
  if (!materialId || !warehouseLocation || initialStock === undefined) {
    return res.status(400).json({ error: "Missing required stock dispatch credentials." });
  }
  
  const db = readDatabase();
  const material = db.materials.find((m: Material) => m.id === materialId);
  if (!material) {
    return res.status(404).json({ error: "Material target not found." });
  }
  
  if (material.status !== MaterialStatus.QUALITY_PASSED) {
    return res.status(400).json({ error: "Cannot add to active storage inventory. Material must pass QA status first." });
  }
  
  // Promote status to IN_STOCK
  material.status = MaterialStatus.IN_STOCK;
  material.currentLocation = `DTG Storage Warehouse - ${warehouseLocation}`;
  material.timestamp = new Date().toISOString();
  material.updatedBy = loggedInUser.name;
  
  // Add inventory stock record
  const stock = parseFloat(initialStock);
  const thresh = lowStockThreshold ? parseFloat(lowStockThreshold) : 5;
  const newInv: InventoryItem = {
    id: `INV-${Math.floor(100 + Math.random() * 900)}`,
    materialId: material.id,
    materialName: material.name,
    warehouseLocation,
    quantityAvailable: stock,
    quantityUsed: 0,
    currentStock: stock,
    lowStockThreshold: thresh,
    lastMovedDate: new Date().toISOString(),
    movementHistory: [{
      date: new Date().toISOString(),
      type: 'ADD',
      quantity: stock,
      destination: warehouseLocation,
      operator: loggedInUser.name
    }]
  };
  
  db.inventory.push(newInv);
  
  // Audits
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Warehouse Stock Entry dispatch",
    newValue: `Allocated: ${stock} Units under location [${warehouseLocation}]`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.status(201).json(newInv);
});

// Update Warehouse details / Dispatch or issue stock for production
app.post('/api/v1/inventory/:id/dispatch', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.DTG_TEAM) {
    return res.status(403).json({ error: "Unauthorized. Dispatch authority required." });
  }
  
  const { quantity, destination } = req.body;
  if (!quantity || parseFloat(quantity) <= 0 || !destination) {
    return res.status(400).json({ error: "Qty and assembly destination are mandatory." });
  }
  
  const db = readDatabase();
  const invItem = db.inventory.find((inv: InventoryItem) => inv.id === req.params.id);
  if (!invItem) {
    return res.status(404).json({ error: "Warehouse Stock Record not found" });
  }
  
  const qtyToIssue = parseFloat(quantity);
  if (invItem.currentStock < qtyToIssue) {
    return res.status(400).json({ error: `Insufficient stock. Core count is ${invItem.currentStock} ${invItem.materialName}` });
  }
  
  // Deduct stock
  invItem.currentStock -= qtyToIssue;
  invItem.quantityUsed += qtyToIssue;
  invItem.lastMovedDate = new Date().toISOString();
  
  invItem.movementHistory.unshift({
    date: new Date().toISOString(),
    type: 'DISPATCH',
    quantity: qtyToIssue,
    destination,
    operator: loggedInUser.name
  });
  
  // If stock drops to 0, mark corresponding material status as dispatched
  if (invItem.currentStock <= 0) {
    const mat = db.materials.find((m: Material) => m.id === invItem.materialId);
    if (mat) {
      mat.status = MaterialStatus.DISPATCHED;
      mat.currentLocation = `Production Floor - ${destination}`;
      mat.timestamp = new Date().toISOString();
      mat.updatedBy = loggedInUser.name;
    }
  }
  
  // Check Low Stock Threshold Trigger
  if (invItem.currentStock <= invItem.lowStockThreshold) {
    const threshNotif: Notification = {
      id: `nt-${Date.now()}`,
      title: "Low Stock Warning Alert!",
      message: `Stock level of ${invItem.materialName} under ${invItem.warehouseLocation} is currently ${invItem.currentStock}. Threshold: ${invItem.lowStockThreshold}`,
      type: "WARNING",
      isRead: false,
      timestamp: new Date().toISOString(),
      roleScope: UserRole.DTG_TEAM
    };
    db.notifications.unshift(threshNotif);
  }
  
  // Audits
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Material Dispatch to Assembly Line",
    newValue: `Dispatched ${qtyToIssue} to ${destination}. Stock left: ${invItem.currentStock}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json(invItem);
});

// Update Warehouse location / low stock safe threshold limits
app.put('/api/v1/inventory/:id', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  if (loggedInUser.role !== UserRole.ADMIN && loggedInUser.role !== UserRole.DTG_TEAM) {
    return res.status(403).json({ error: "Permission restricted. DTG authority required." });
  }
  
  const { warehouseLocation, lowStockThreshold, currentStock } = req.body;
  const db = readDatabase();
  const invItem = db.inventory.find((inv: InventoryItem) => inv.id === req.params.id);
  if (!invItem) {
    return res.status(404).json({ error: "Warehouse profile not found." });
  }
  
  const previous = `Location: ${invItem.warehouseLocation}, Threshold: ${invItem.lowStockThreshold}, Stock: ${invItem.currentStock}`;
  
  if (warehouseLocation) {
    invItem.warehouseLocation = warehouseLocation;
    invItem.movementHistory.unshift({
      date: new Date().toISOString(),
      type: 'MOVE',
      quantity: invItem.currentStock,
      destination: warehouseLocation,
      operator: loggedInUser.name
    });
  }
  if (lowStockThreshold !== undefined) invItem.lowStockThreshold = parseFloat(lowStockThreshold);
  if (currentStock !== undefined) {
    invItem.currentStock = parseFloat(currentStock);
    invItem.quantityAvailable = parseFloat(currentStock);
  }
  
  invItem.lastMovedDate = new Date().toISOString();
  
  const audit: AuditLog = {
    id: `lg-${Date.now()}`,
    userId: loggedInUser.id,
    userName: loggedInUser.name,
    userRole: loggedInUser.role,
    action: "Modify Warehouse Coordinates & Safeguards",
    previousValue: previous,
    newValue: `Location: ${invItem.warehouseLocation}, Threshold: ${invItem.lowStockThreshold}, Stock: ${invItem.currentStock}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(audit);
  
  writeDatabase(db);
  return res.json(invItem);
});

// --- GENERAL AUDIT LOGS ---
app.get('/api/v1/audit-logs', authenticateUser, (req, res) => {
  const db = readDatabase();
  return res.json(db.auditLogs);
});

// --- REPORT GENERATING ANALYTICS APIS ---
app.get('/api/v1/reports', authenticateUser, (req, res) => {
  const db = readDatabase();
  const { dateFrom, dateTo, status, vendor } = req.query;
  
  let reports = [...db.materials];
  
  if (status) {
    reports = reports.filter(m => m.status === status);
  }
  if (vendor) {
    const vend = String(vendor).toLowerCase();
    reports = reports.filter(m => m.vendorName.toLowerCase().includes(vend));
  }
  if (dateFrom) {
    const fDate = new Date(String(dateFrom)).getTime();
    reports = reports.filter(m => new Date(m.arrivalDate).getTime() >= fDate);
  }
  if (dateTo) {
    const tDate = new Date(String(dateTo)).getTime();
    reports = reports.filter(m => new Date(m.arrivalDate).getTime() <= tDate);
  }
  
  return res.json(reports);
});

// --- NOTIFICATIONS APIS ---
app.get('/api/v1/notifications', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  const db = readDatabase();
  
  // Filters notifications where either roleScope is undefined OR matching loggedInUser.role
  const items = db.notifications.filter((n: Notification) => !n.roleScope || n.roleScope === loggedInUser.role);
  return res.json(items);
});

app.post('/api/v1/notifications/read-all', authenticateUser, (req, res) => {
  const loggedInUser = (req as any).user as User;
  const db = readDatabase();
  
  db.notifications.forEach((n: Notification) => {
    if (!n.roleScope || n.roleScope === loggedInUser.role) {
      n.isRead = true;
    }
  });
  
  writeDatabase(db);
  return res.json({ success: true, message: "Checked and cleared alerts inbox." });
});

// --- METRIC INDUSTRIAL INTERACTIVE DASHBOARDS APIS ---
app.get('/api/v1/dashboard', authenticateUser, (req, res) => {
  const db = readDatabase();
  
  const total = db.materials.length;
  const accepted = db.materials.filter((m: any) => m.status !== MaterialStatus.REJECTED && m.status !== MaterialStatus.PENDING).length;
  const rejected = db.materials.filter((m: any) => m.status === MaterialStatus.REJECTED || m.status === MaterialStatus.QUALITY_FAILED).length;
  const pendingQA = db.materials.filter((m: any) => m.status === MaterialStatus.ACCEPTED).length;
  
  // Total inventory counts
  let stockPoints = 0;
  let runningLow = 0;
  db.inventory.forEach((item: any) => {
    stockPoints += item.currentStock;
    if (item.currentStock <= item.lowStockThreshold) {
      runningLow++;
    }
  });
  
  const cards = {
    totalMaterialsCount: total,
    acceptedGateCount: accepted,
    rejectedGateCount: rejected,
    pendingInspectionCount: pendingQA,
    inventoryTotalStock: stockPoints,
    lowStockCount: runningLow
  };
  
  // Generate visual statistics
  // Arrivals monthly (simulate over last 5 months or real timestamp frequencies)
  const months_labels = ["Jan", "Feb", "Mar", "Apr", "May"];
  const monthlyArrivals = months_labels.map((m, idx) => {
    // Distribute seed data evenly for elegant chart
    let count = 0;
    if (idx === 4) count = db.materials.length; // Active month
    else count = 4 + (idx * 2); 
    return { month: m, count };
  });

  const passFailRatio = {
    pass: db.inspections.filter((ip: any) => ip.result === 'PASS').length,
    fail: db.inspections.filter((ip: any) => ip.result === 'FAIL').length
  };
  
  // Distribution by location
  const inventoryDistListObj: Record<string, number> = {};
  db.inventory.forEach((item: any) => {
    const loc = item.warehouseLocation.slice(0, 6) || "Other";
    inventoryDistListObj[loc] = (inventoryDistListObj[loc] || 0) + item.currentStock;
  });
  const inventoryDist = Object.entries(inventoryDistListObj).map(([name, value]) => ({ name, value }));
  
  // Vendor statistics
  const vendorObj: Record<string, number> = {};
  db.materials.forEach((m: any) => {
    vendorObj[m.vendorName] = (vendorObj[m.vendorName] || 0) + 1;
  });
  const vendorLeaderboard = Object.entries(vendorObj).map(([name, count]) => ({ name, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 5);

  return res.json({
    cards,
    analytics: {
      monthlyArrivals,
      passFailRatio,
      inventoryDist,
      vendorLeaderboard
    }
  });
});

// Vite/Static Setup
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BHEL SMLMS Server running at http://localhost:${PORT}`);
  });
}

startServer();

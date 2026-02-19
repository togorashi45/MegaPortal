import type { ModuleKey } from "@/types/portal";

export type DemoFieldType = "text" | "number" | "date" | "select" | "textarea" | "url";

export interface DemoField {
  key: string;
  label: string;
  type: DemoFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string | number;
}

export interface DemoColumn {
  key: string;
  label: string;
  format?: "text" | "number" | "money" | "date" | "status" | "link";
}

export interface DemoModuleRow {
  id: string;
  status: string;
  updatedAt: string;
  [key: string]: string | number;
}

export interface DemoModuleConfig {
  title: string;
  description: string;
  storageKey: string;
  statusOptions: string[];
  metricLabel: string;
  fields: DemoField[];
  columns: DemoColumn[];
  seedRows: DemoModuleRow[];
}

export type DemoModuleKey = Extract<
  ModuleKey,
  | "decisions"
  | "deal-analyzer"
  | "comp-tracker"
  | "contractor-directory"
  | "appfolio-dashboard"
  | "tax-insurance"
  | "note-tracker"
  | "flip-tracker"
  | "cashflow"
  | "rehab-scope"
  | "lending-capital-tracker"
  | "document-vault"
  | "health-tracker"
  | "house-manual"
  | "family-manual"
  | "flip-forecasting-dashboard"
  | "automation-engine"
>;

export const demoModuleConfigs: Record<DemoModuleKey, DemoModuleConfig> = {
  decisions: {
    title: "Executive Decision Journal",
    description: "Capture strategic decisions, confidence level, and review checkpoints.",
    storageKey: "sampleportal.decisions",
    statusOptions: ["DRAFT", "IN_REVIEW", "DECIDED", "CLOSED"],
    metricLabel: "Open Decisions",
    fields: [
      { key: "title", label: "Decision Title", type: "text", required: true, placeholder: "Expand DFW acquisition lane" },
      { key: "owner", label: "Owner", type: "select", options: ["Jake", "Ian", "Ops"], defaultValue: "Jake" },
      { key: "framework", label: "Framework", type: "select", options: ["WRAP", "10/10/10", "Reversible/Irreversible"], defaultValue: "WRAP" },
      { key: "confidence", label: "Confidence %", type: "number", defaultValue: 70 },
      { key: "reviewDate", label: "Review Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["DRAFT", "IN_REVIEW", "DECIDED", "CLOSED"], defaultValue: "DRAFT" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Key assumptions and risks..." },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "owner", label: "Owner" },
      { key: "framework", label: "Framework" },
      { key: "confidence", label: "Confidence", format: "number" },
      { key: "reviewDate", label: "Review", format: "date" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "d1", title: "Prioritize private lending over wholesale volume", owner: "Jake", framework: "Reversible/Irreversible", confidence: 82, reviewDate: "2026-03-03", status: "DECIDED", updatedAt: "2026-02-19" },
      { id: "d2", title: "Adopt weekly Monday ops war-room", owner: "Ian", framework: "WRAP", confidence: 75, reviewDate: "2026-02-26", status: "IN_REVIEW", updatedAt: "2026-02-18" },
      { id: "d3", title: "Pause underperforming tertiary zip expansion", owner: "Ops", framework: "10/10/10", confidence: 68, reviewDate: "2026-02-22", status: "DRAFT", updatedAt: "2026-02-19" },
    ],
  },
  "deal-analyzer": {
    title: "Deal Analyzer",
    description: "Underwrite wholesale, flip, and rental opportunities from one interface.",
    storageKey: "sampleportal.deal-analyzer",
    statusOptions: ["UNDERWRITING", "READY_TO_OFFER", "OFFERED", "PASSED"],
    metricLabel: "Active Underwrites",
    fields: [
      { key: "property", label: "Property", type: "text", required: true, placeholder: "123 Oak St, Dallas" },
      { key: "strategy", label: "Strategy", type: "select", options: ["Wholesale", "Flip", "Rental"], defaultValue: "Flip" },
      { key: "purchase", label: "Purchase Price", type: "number", defaultValue: 160000 },
      { key: "rehab", label: "Rehab Budget", type: "number", defaultValue: 45000 },
      { key: "arv", label: "ARV", type: "number", defaultValue: 295000 },
      { key: "margin", label: "Projected Margin", type: "number", defaultValue: 62000 },
      { key: "status", label: "Status", type: "select", options: ["UNDERWRITING", "READY_TO_OFFER", "OFFERED", "PASSED"], defaultValue: "UNDERWRITING" },
    ],
    columns: [
      { key: "property", label: "Property" },
      { key: "strategy", label: "Strategy" },
      { key: "purchase", label: "Purchase", format: "money" },
      { key: "rehab", label: "Rehab", format: "money" },
      { key: "arv", label: "ARV", format: "money" },
      { key: "margin", label: "Margin", format: "money" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "da1", property: "412 Birch Ave, Fort Worth", strategy: "Flip", purchase: 172000, rehab: 52000, arv: 338000, margin: 71000, status: "READY_TO_OFFER", updatedAt: "2026-02-19" },
      { id: "da2", property: "932 Pine Dr, Garland", strategy: "Wholesale", purchase: 128000, rehab: 19000, arv: 214000, margin: 22000, status: "UNDERWRITING", updatedAt: "2026-02-18" },
    ],
  },
  "comp-tracker": {
    title: "Comp & Market Tracker",
    description: "Store comp records, market context, and ARV confidence inputs.",
    storageKey: "sampleportal.comp-tracker",
    statusOptions: ["VERIFIED", "PENDING", "REJECTED"],
    metricLabel: "Verified Comps",
    fields: [
      { key: "address", label: "Address", type: "text", required: true, placeholder: "2019 Walnut St, Plano" },
      { key: "zip", label: "ZIP", type: "text", defaultValue: "75074" },
      { key: "sqft", label: "Sq Ft", type: "number", defaultValue: 1650 },
      { key: "beds", label: "Beds", type: "number", defaultValue: 3 },
      { key: "baths", label: "Baths", type: "number", defaultValue: 2 },
      { key: "salePrice", label: "Sale Price", type: "number", defaultValue: 282000 },
      { key: "saleDate", label: "Sale Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["VERIFIED", "PENDING", "REJECTED"], defaultValue: "PENDING" },
    ],
    columns: [
      { key: "address", label: "Address" },
      { key: "zip", label: "ZIP" },
      { key: "sqft", label: "Sq Ft", format: "number" },
      { key: "salePrice", label: "Sale Price", format: "money" },
      { key: "saleDate", label: "Sale Date", format: "date" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "ct1", address: "701 Elm St, Dallas", zip: "75202", sqft: 1880, beds: 3, baths: 2, salePrice: 319000, saleDate: "2026-01-25", status: "VERIFIED", updatedAt: "2026-02-19" },
      { id: "ct2", address: "3840 Mesa Ct, Plano", zip: "75023", sqft: 1715, beds: 3, baths: 2, salePrice: 301500, saleDate: "2026-02-08", status: "PENDING", updatedAt: "2026-02-18" },
    ],
  },
  "contractor-directory": {
    title: "Contractor & Vendor Directory",
    description: "Track preferred vendors, compliance, and trade coverage.",
    storageKey: "sampleportal.contractor-directory",
    statusOptions: ["ACTIVE", "INACTIVE", "DO_NOT_USE"],
    metricLabel: "Active Vendors",
    fields: [
      { key: "vendor", label: "Vendor Name", type: "text", required: true, placeholder: "North Star Roofing" },
      { key: "trade", label: "Trade", type: "select", options: ["Roofing", "HVAC", "Electrical", "Plumbing", "General"], defaultValue: "General" },
      { key: "rating", label: "Rating / 5", type: "number", defaultValue: 4.5 },
      { key: "phone", label: "Phone", type: "text", placeholder: "(555) 123-9000" },
      { key: "insured", label: "Insurance", type: "select", options: ["Verified", "Pending"], defaultValue: "Verified" },
      { key: "status", label: "Status", type: "select", options: ["ACTIVE", "INACTIVE", "DO_NOT_USE"], defaultValue: "ACTIVE" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Performance notes..." },
    ],
    columns: [
      { key: "vendor", label: "Vendor" },
      { key: "trade", label: "Trade" },
      { key: "rating", label: "Rating", format: "number" },
      { key: "insured", label: "Insurance" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "vd1", vendor: "Lone Star Electric", trade: "Electrical", rating: 4.8, phone: "(214) 555-1922", insured: "Verified", status: "ACTIVE", updatedAt: "2026-02-18" },
      { id: "vd2", vendor: "Rapid Restore HVAC", trade: "HVAC", rating: 3.7, phone: "(469) 555-7190", insured: "Pending", status: "INACTIVE", updatedAt: "2026-02-17" },
    ],
  },
  "appfolio-dashboard": {
    title: "Appfolio Integration Dashboard",
    description: "Monitor occupancy, delinquency, NOI, and sync health snapshots.",
    storageKey: "sampleportal.appfolio-dashboard",
    statusOptions: ["HEALTHY", "WATCH", "ERROR"],
    metricLabel: "Properties Synced",
    fields: [
      { key: "property", label: "Property", type: "text", required: true, placeholder: "Cedar Ridge Townhomes" },
      { key: "units", label: "Total Units", type: "number", defaultValue: 48 },
      { key: "occupied", label: "Occupied Units", type: "number", defaultValue: 45 },
      { key: "delinquent", label: "Delinquent Leases", type: "number", defaultValue: 2 },
      { key: "noi", label: "Monthly NOI", type: "number", defaultValue: 38120 },
      { key: "status", label: "Sync Health", type: "select", options: ["HEALTHY", "WATCH", "ERROR"], defaultValue: "HEALTHY" },
    ],
    columns: [
      { key: "property", label: "Property" },
      { key: "units", label: "Units", format: "number" },
      { key: "occupied", label: "Occupied", format: "number" },
      { key: "delinquent", label: "Delinquent", format: "number" },
      { key: "noi", label: "NOI", format: "money" },
      { key: "status", label: "Sync Health", format: "status" },
    ],
    seedRows: [
      { id: "ap1", property: "Southlake Duplexes", units: 32, occupied: 30, delinquent: 1, noi: 24650, status: "HEALTHY", updatedAt: "2026-02-19" },
      { id: "ap2", property: "Brookhaven Villas", units: 56, occupied: 49, delinquent: 4, noi: 35840, status: "WATCH", updatedAt: "2026-02-18" },
    ],
  },
  "tax-insurance": {
    title: "Tax & Insurance Tracker",
    description:
      "Unified property tax and insurance operations log with payment site, statement/receipt, carrier, and EOI link tracking.",
    storageKey: "sampleportal.tax-insurance",
    statusOptions: ["ON_TRACK", "DUE_SOON", "OVERDUE", "QUOTE_PENDING"],
    metricLabel: "Items Requiring Action",
    fields: [
      {
        key: "property",
        label: "Property",
        type: "text",
        required: true,
        placeholder: "5203 43rd",
      },
      {
        key: "taxYear",
        label: "Tax Year",
        type: "select",
        options: ["2024", "2025", "2026"],
        defaultValue: "2025",
      },
      { key: "taxDue", label: "Tax Due", type: "number", defaultValue: 4200 },
      {
        key: "paymentSite",
        label: "Online Payment Site",
        type: "url",
        placeholder: "https://county-tax-site.example",
      },
      {
        key: "taxStatus",
        label: "Tax Status",
        type: "select",
        options: ["PAID", "DUE", "ESCROWED", "NOT_DUE"],
        defaultValue: "DUE",
      },
      { key: "statement", label: "Statement", type: "number", defaultValue: 0 },
      { key: "receipt", label: "Receipt", type: "number", defaultValue: 0 },
      { key: "convenienceFee", label: "Convenience Fee", type: "number", defaultValue: 0 },
      { key: "renewal", label: "Insurance Expiration", type: "date" },
      { key: "premium", label: "Insurance Amount", type: "number", defaultValue: 0 },
      { key: "carrier", label: "Carrier", type: "text", placeholder: "Foremost Insurance Company" },
      { key: "agency", label: "Agent / Agency", type: "text", placeholder: "RiskWell Insurance Agency" },
      { key: "eoiLink", label: "EOI / Policy Link", type: "url", placeholder: "https://drive.google.com/..." },
      { key: "status", label: "Overall Status", type: "select", options: ["ON_TRACK", "DUE_SOON", "OVERDUE", "QUOTE_PENDING"], defaultValue: "DUE_SOON" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Escrowed by servicer, renewal quote pending, etc." },
    ],
    columns: [
      { key: "property", label: "Property" },
      { key: "taxYear", label: "Year" },
      { key: "taxDue", label: "Tax Due", format: "money" },
      { key: "taxStatus", label: "Tax Status" },
      { key: "renewal", label: "Insurance Exp.", format: "date" },
      { key: "premium", label: "Insurance Amt", format: "money" },
      { key: "carrier", label: "Carrier" },
      { key: "paymentSite", label: "Pay Site", format: "link" },
      { key: "eoiLink", label: "EOI", format: "link" },
      { key: "status", label: "Overall", format: "status" },
    ],
    seedRows: [
      {
        id: "ti1",
        property: "Personal home - 1600 Buckeye",
        taxYear: "2025",
        taxDue: 6592.64,
        paymentSite: "https://www.larimer.gov/treasurer/pay",
        taxStatus: "DUE",
        statement: 6592.64,
        receipt: 0,
        convenienceFee: 0,
        renewal: "2026-04-30",
        premium: 0,
        carrier: "Pending Quote",
        agency: "RiskWell Insurance Agency",
        eoiLink: "https://drive.google.com",
        status: "DUE_SOON",
        notes: "1st half due by 2/28 or full amount due by 4/30.",
        updatedAt: "2026-02-19",
      },
      {
        id: "ti2",
        property: "5203 43rd",
        taxYear: "2025",
        taxDue: 4228.55,
        paymentSite: "http://www.lubbockcad.org/",
        taxStatus: "PAID",
        statement: 4228.55,
        receipt: 4270.42,
        convenienceFee: 1.5,
        renewal: "2026-03-24",
        premium: 3103.7,
        carrier: "Fortegra Specialty Insurance Company",
        agency: "RiskWell Insurance Agency",
        eoiLink: "https://drive.google.com",
        status: "ON_TRACK",
        notes: "Paid via 1120. 2026 policy renewal in progress.",
        updatedAt: "2026-02-19",
      },
      {
        id: "ti3",
        property: "715 Beech",
        taxYear: "2025",
        taxDue: 2152.38,
        paymentSite: "https://www.halecad.org/#",
        taxStatus: "ESCROWED",
        statement: 2152.38,
        receipt: 0,
        convenienceFee: 0,
        renewal: "2026-01-31",
        premium: 0,
        carrier: "Escrowed",
        agency: "Servicer",
        eoiLink: "https://drive.google.com",
        status: "ON_TRACK",
        notes: "Paid at closing; monitored through note servicer.",
        updatedAt: "2026-02-19",
      },
      {
        id: "ti4",
        property: "4910 & 5006 Tranquility",
        taxYear: "2026",
        taxDue: 0,
        paymentSite: "https://county-tax-site.example",
        taxStatus: "ESCROWED",
        statement: 0,
        receipt: 0,
        convenienceFee: 0,
        renewal: "2026-07-17",
        premium: 0,
        carrier: "Foremost Insurance Company",
        agency: "Robert Insurance Professionals Inc / Geico Insurance Agency LLC",
        eoiLink: "https://drive.google.com",
        status: "QUOTE_PENDING",
        notes: "Covered by escrow payments; waiting on updated quote confirmation.",
        updatedAt: "2026-02-19",
      },
    ],
  },
  "note-tracker": {
    title: "Note Tracker",
    description: "Track note performance, payment status, and maturity risk.",
    storageKey: "sampleportal.note-tracker",
    statusOptions: ["CURRENT", "LATE", "DEFAULT", "RESOLVED"],
    metricLabel: "Notes in Distress",
    fields: [
      { key: "borrower", label: "Borrower", type: "text", required: true, placeholder: "A. Thompson" },
      { key: "collateral", label: "Collateral Address", type: "text", required: true, placeholder: "1842 Main St, Denton" },
      { key: "upb", label: "UPB", type: "number", defaultValue: 128500 },
      { key: "rate", label: "Interest Rate %", type: "number", defaultValue: 9.5 },
      { key: "maturity", label: "Maturity Date", type: "date" },
      { key: "status", label: "Payment Status", type: "select", options: ["CURRENT", "LATE", "DEFAULT", "RESOLVED"], defaultValue: "CURRENT" },
    ],
    columns: [
      { key: "borrower", label: "Borrower" },
      { key: "collateral", label: "Collateral" },
      { key: "upb", label: "UPB", format: "money" },
      { key: "rate", label: "Rate", format: "number" },
      { key: "maturity", label: "Maturity", format: "date" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "nt1", borrower: "J. Carter", collateral: "512 Waring St, Irving", upb: 112000, rate: 8.75, maturity: "2027-08-01", status: "CURRENT", updatedAt: "2026-02-18" },
      { id: "nt2", borrower: "M. Diaz", collateral: "920 Hayes Ave, Arlington", upb: 137500, rate: 10.5, maturity: "2026-11-15", status: "LATE", updatedAt: "2026-02-19" },
    ],
  },
  "flip-tracker": {
    title: "Flip Project Tracker",
    description: "Track each flip from acquisition through disposition.",
    storageKey: "sampleportal.flip-tracker",
    statusOptions: ["ACQUISITION", "REHAB", "LISTED", "SOLD"],
    metricLabel: "Active Flips",
    fields: [
      { key: "address", label: "Property", type: "text", required: true, placeholder: "3433 Summit Ave, Dallas" },
      { key: "status", label: "Stage", type: "select", options: ["ACQUISITION", "REHAB", "LISTED", "SOLD"], defaultValue: "REHAB" },
      { key: "budget", label: "Budget", type: "number", defaultValue: 78000 },
      { key: "actual", label: "Actual Spend", type: "number", defaultValue: 62400 },
      { key: "projectedProfit", label: "Projected Profit", type: "number", defaultValue: 68000 },
      { key: "closeDate", label: "Target Close", type: "date" },
    ],
    columns: [
      { key: "address", label: "Property" },
      { key: "status", label: "Stage", format: "status" },
      { key: "budget", label: "Budget", format: "money" },
      { key: "actual", label: "Actual", format: "money" },
      { key: "projectedProfit", label: "Projected Profit", format: "money" },
      { key: "closeDate", label: "Target Close", format: "date" },
    ],
    seedRows: [
      { id: "ft1", address: "2809 Leon Dr, Plano", status: "REHAB", budget: 84500, actual: 49200, projectedProfit: 74200, closeDate: "2026-05-14", updatedAt: "2026-02-19" },
      { id: "ft2", address: "9602 Cherry Ln, Dallas", status: "LISTED", budget: 65300, actual: 66990, projectedProfit: 38400, closeDate: "2026-03-03", updatedAt: "2026-02-18" },
    ],
  },
  cashflow: {
    title: "Cash Flow Projection Tool",
    description: "Maintain best/base/worst scenarios with month-over-month net position.",
    storageKey: "sampleportal.cashflow",
    statusOptions: ["POSITIVE", "TIGHT", "NEGATIVE"],
    metricLabel: "Negative Months",
    fields: [
      { key: "scenario", label: "Scenario", type: "select", options: ["Base", "Best", "Worst"], defaultValue: "Base" },
      { key: "month", label: "Month", type: "text", placeholder: "2026-04" },
      { key: "inflow", label: "Projected Inflow", type: "number", defaultValue: 245000 },
      { key: "outflow", label: "Projected Outflow", type: "number", defaultValue: 191000 },
      { key: "net", label: "Net Cash", type: "number", defaultValue: 54000 },
      { key: "status", label: "Status", type: "select", options: ["POSITIVE", "TIGHT", "NEGATIVE"], defaultValue: "POSITIVE" },
    ],
    columns: [
      { key: "scenario", label: "Scenario" },
      { key: "month", label: "Month" },
      { key: "inflow", label: "Inflow", format: "money" },
      { key: "outflow", label: "Outflow", format: "money" },
      { key: "net", label: "Net", format: "money" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "cf1", scenario: "Base", month: "2026-03", inflow: 214000, outflow: 201500, net: 12500, status: "TIGHT", updatedAt: "2026-02-19" },
      { id: "cf2", scenario: "Worst", month: "2026-03", inflow: 181200, outflow: 208400, net: -27200, status: "NEGATIVE", updatedAt: "2026-02-19" },
    ],
  },
  "rehab-scope": {
    title: "Rehab Scope & Budget Tracker",
    description: "Manage room-level scope line items, vendor assignment, and budget deltas.",
    storageKey: "sampleportal.rehab-scope",
    statusOptions: ["TO_BID", "IN_PROGRESS", "DONE", "ISSUE"],
    metricLabel: "Items In Progress",
    fields: [
      { key: "project", label: "Project", type: "text", required: true, placeholder: "2809 Leon Dr" },
      { key: "room", label: "Room", type: "select", options: ["Kitchen", "Primary Bath", "Exterior", "Living Room"], defaultValue: "Kitchen" },
      { key: "lineItem", label: "Line Item", type: "text", required: true, placeholder: "Cabinet replacement" },
      { key: "vendor", label: "Vendor", type: "text", placeholder: "Lone Star Renovations" },
      { key: "budget", label: "Budget", type: "number", defaultValue: 7800 },
      { key: "actual", label: "Actual", type: "number", defaultValue: 0 },
      { key: "status", label: "Status", type: "select", options: ["TO_BID", "IN_PROGRESS", "DONE", "ISSUE"], defaultValue: "TO_BID" },
    ],
    columns: [
      { key: "project", label: "Project" },
      { key: "room", label: "Room" },
      { key: "lineItem", label: "Line Item" },
      { key: "vendor", label: "Vendor" },
      { key: "budget", label: "Budget", format: "money" },
      { key: "actual", label: "Actual", format: "money" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "rh1", project: "2809 Leon Dr", room: "Kitchen", lineItem: "Quartz counters", vendor: "Stone Masters", budget: 5200, actual: 4800, status: "DONE", updatedAt: "2026-02-18" },
      { id: "rh2", project: "2809 Leon Dr", room: "Exterior", lineItem: "Fence repair", vendor: "North Dallas Fencing", budget: 2600, actual: 0, status: "TO_BID", updatedAt: "2026-02-19" },
    ],
  },
  "lending-capital-tracker": {
    title: "Lending & Capital Tracker",
    description: "Track lender exposure, maturity dates, and covenant health.",
    storageKey: "sampleportal.lending-capital-tracker",
    statusOptions: ["CLEAR", "WATCH", "BREACH"],
    metricLabel: "Loans On Watch",
    fields: [
      { key: "lender", label: "Lender", type: "text", required: true, placeholder: "Northline Capital" },
      { key: "facility", label: "Facility Type", type: "select", options: ["Bridge", "Credit Line", "Private Note"], defaultValue: "Bridge" },
      { key: "principal", label: "Principal", type: "number", defaultValue: 450000 },
      { key: "rate", label: "Rate %", type: "number", defaultValue: 11.5 },
      { key: "maturity", label: "Maturity Date", type: "date" },
      { key: "status", label: "Covenant Status", type: "select", options: ["CLEAR", "WATCH", "BREACH"], defaultValue: "CLEAR" },
    ],
    columns: [
      { key: "lender", label: "Lender" },
      { key: "facility", label: "Facility" },
      { key: "principal", label: "Principal", format: "money" },
      { key: "rate", label: "Rate", format: "number" },
      { key: "maturity", label: "Maturity", format: "date" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "ln1", lender: "Anchor Street Funding", facility: "Bridge", principal: 680000, rate: 10.9, maturity: "2026-08-31", status: "WATCH", updatedAt: "2026-02-19" },
      { id: "ln2", lender: "Eagle Crest Private", facility: "Private Note", principal: 220000, rate: 9.25, maturity: "2027-01-15", status: "CLEAR", updatedAt: "2026-02-18" },
    ],
  },
  "document-vault": {
    title: "Document Vault",
    description: "Index Google Drive documents by property, deal, and category.",
    storageKey: "sampleportal.document-vault",
    statusOptions: ["ACTIVE", "REVIEW_NEEDED", "ARCHIVED"],
    metricLabel: "Docs Needing Review",
    fields: [
      { key: "name", label: "Document Name", type: "text", required: true, placeholder: "Title commitment - 2809 Leon" },
      { key: "category", label: "Category", type: "select", options: ["Title", "Insurance", "Lender", "Contract", "Tax"], defaultValue: "Contract" },
      { key: "entity", label: "Linked Entity", type: "text", placeholder: "2809 Leon Dr" },
      { key: "owner", label: "Owner", type: "text", defaultValue: "Ops" },
      { key: "driveUrl", label: "Drive URL", type: "url", placeholder: "https://drive.google.com/..." },
      { key: "status", label: "Status", type: "select", options: ["ACTIVE", "REVIEW_NEEDED", "ARCHIVED"], defaultValue: "ACTIVE" },
    ],
    columns: [
      { key: "name", label: "Document" },
      { key: "category", label: "Category" },
      { key: "entity", label: "Linked To" },
      { key: "owner", label: "Owner" },
      { key: "driveUrl", label: "Drive Link", format: "link" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "dv1", name: "Insurance Binder - 9602 Cherry", category: "Insurance", entity: "9602 Cherry Ln", owner: "Ops", driveUrl: "https://drive.google.com", status: "ACTIVE", updatedAt: "2026-02-18" },
      { id: "dv2", name: "Tax Certificate - 2809 Leon", category: "Tax", entity: "2809 Leon Dr", owner: "Finance", driveUrl: "https://drive.google.com", status: "REVIEW_NEEDED", updatedAt: "2026-02-19" },
    ],
  },
  "health-tracker": {
    title: "Personal Health Tracker",
    description: "Private super-admin dashboard for biometrics, training, and habits.",
    storageKey: "sampleportal.health-tracker",
    statusOptions: ["ON_TRACK", "MONITOR", "OFF_TRACK"],
    metricLabel: "Entries This Week",
    fields: [
      { key: "date", label: "Date", type: "date" },
      { key: "sleep", label: "Sleep Hours", type: "number", defaultValue: 7.5 },
      { key: "weight", label: "Weight (lb)", type: "number", defaultValue: 196 },
      { key: "workout", label: "Workout", type: "select", options: ["Lift", "Zone 2", "Recovery", "Off"], defaultValue: "Lift" },
      { key: "supplements", label: "Supplements", type: "select", options: ["Complete", "Partial", "Skipped"], defaultValue: "Complete" },
      { key: "status", label: "Status", type: "select", options: ["ON_TRACK", "MONITOR", "OFF_TRACK"], defaultValue: "ON_TRACK" },
    ],
    columns: [
      { key: "date", label: "Date", format: "date" },
      { key: "sleep", label: "Sleep", format: "number" },
      { key: "weight", label: "Weight", format: "number" },
      { key: "workout", label: "Workout" },
      { key: "supplements", label: "Supps" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "hl1", date: "2026-02-18", sleep: 7.1, weight: 196.4, workout: "Lift", supplements: "Complete", status: "ON_TRACK", updatedAt: "2026-02-18" },
      { id: "hl2", date: "2026-02-19", sleep: 6.2, weight: 197.2, workout: "Recovery", supplements: "Partial", status: "MONITOR", updatedAt: "2026-02-19" },
    ],
  },
  "house-manual": {
    title: "House Operating Manual",
    description: "Track home systems, maintenance cadence, and vendor responsibilities.",
    storageKey: "sampleportal.house-manual",
    statusOptions: ["SCHEDULED", "DUE_SOON", "OVERDUE", "COMPLETE"],
    metricLabel: "Maintenance Tasks Due",
    fields: [
      { key: "system", label: "System", type: "select", options: ["HVAC", "Plumbing", "Electrical", "Pool", "Security"], defaultValue: "HVAC" },
      { key: "task", label: "Task", type: "text", required: true, placeholder: "Replace upstairs filter" },
      { key: "frequency", label: "Frequency", type: "select", options: ["Monthly", "Quarterly", "Biannual", "Annual"], defaultValue: "Quarterly" },
      { key: "nextDue", label: "Next Due", type: "date" },
      { key: "vendor", label: "Vendor", type: "text", placeholder: "Airflow Mechanical" },
      { key: "status", label: "Status", type: "select", options: ["SCHEDULED", "DUE_SOON", "OVERDUE", "COMPLETE"], defaultValue: "SCHEDULED" },
    ],
    columns: [
      { key: "system", label: "System" },
      { key: "task", label: "Task" },
      { key: "frequency", label: "Frequency" },
      { key: "nextDue", label: "Next Due", format: "date" },
      { key: "vendor", label: "Vendor" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "hm1", system: "HVAC", task: "Spring system tune-up", frequency: "Biannual", nextDue: "2026-03-10", vendor: "Airflow Mechanical", status: "DUE_SOON", updatedAt: "2026-02-19" },
      { id: "hm2", system: "Pool", task: "Pump pressure check", frequency: "Monthly", nextDue: "2026-02-21", vendor: "AquaSpark", status: "SCHEDULED", updatedAt: "2026-02-18" },
    ],
  },
  "family-manual": {
    title: "Family Operating Manual",
    description: "Centralize routines, care notes, key dates, and shared logistics.",
    storageKey: "sampleportal.family-manual",
    statusOptions: ["ACTIVE", "UPCOMING", "ARCHIVED"],
    metricLabel: "Upcoming Family Items",
    fields: [
      { key: "member", label: "Family Member", type: "select", options: ["Jake", "Spouse", "Child A", "Child B"], defaultValue: "Child A" },
      { key: "type", label: "Item Type", type: "select", options: ["Medical", "Schedule", "Routine", "Document"], defaultValue: "Schedule" },
      { key: "title", label: "Item", type: "text", required: true, placeholder: "Pediatrician annual physical" },
      { key: "dueDate", label: "Due Date", type: "date" },
      { key: "owner", label: "Owner", type: "text", defaultValue: "Jake" },
      { key: "status", label: "Status", type: "select", options: ["ACTIVE", "UPCOMING", "ARCHIVED"], defaultValue: "UPCOMING" },
    ],
    columns: [
      { key: "member", label: "Member" },
      { key: "type", label: "Type" },
      { key: "title", label: "Item" },
      { key: "dueDate", label: "Due Date", format: "date" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "fm1", member: "Child A", type: "Medical", title: "Allergy refill follow-up", dueDate: "2026-03-02", owner: "Jake", status: "UPCOMING", updatedAt: "2026-02-19" },
      { id: "fm2", member: "Spouse", type: "Routine", title: "Weekly planning sync", dueDate: "2026-02-22", owner: "Jake", status: "ACTIVE", updatedAt: "2026-02-18" },
    ],
  },
  "flip-forecasting-dashboard": {
    title: "Flip Forecasting Dashboard",
    description: "Flagship forecasting workspace for portfolio risk and scenario planning.",
    storageKey: "sampleportal.flip-forecasting-dashboard",
    statusOptions: ["ON_TARGET", "WATCH", "RED_FLAG"],
    metricLabel: "Red Flag Projects",
    fields: [
      { key: "project", label: "Project", type: "text", required: true, placeholder: "9602 Cherry Ln" },
      { key: "scenario", label: "Scenario", type: "select", options: ["Base", "Upside", "Downside"], defaultValue: "Base" },
      { key: "purchase", label: "Purchase", type: "number", defaultValue: 188000 },
      { key: "rehab", label: "Rehab", type: "number", defaultValue: 72000 },
      { key: "holding", label: "Holding Cost", type: "number", defaultValue: 14800 },
      { key: "sale", label: "Projected Sale", type: "number", defaultValue: 346000 },
      { key: "profit", label: "Projected Profit", type: "number", defaultValue: 71200 },
      { key: "status", label: "Status", type: "select", options: ["ON_TARGET", "WATCH", "RED_FLAG"], defaultValue: "ON_TARGET" },
    ],
    columns: [
      { key: "project", label: "Project" },
      { key: "scenario", label: "Scenario" },
      { key: "purchase", label: "Purchase", format: "money" },
      { key: "rehab", label: "Rehab", format: "money" },
      { key: "sale", label: "Projected Sale", format: "money" },
      { key: "profit", label: "Profit", format: "money" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "ff1", project: "9602 Cherry Ln", scenario: "Base", purchase: 193000, rehab: 68400, holding: 13200, sale: 344000, profit: 69400, status: "WATCH", updatedAt: "2026-02-19" },
      { id: "ff2", project: "2809 Leon Dr", scenario: "Upside", purchase: 171500, rehab: 71200, holding: 14900, sale: 366000, profit: 108400, status: "ON_TARGET", updatedAt: "2026-02-18" },
    ],
  },
  "automation-engine": {
    title: "Automation & Sync Engine",
    description: "Control scheduled jobs, cross-module syncs, and alerting workflows.",
    storageKey: "sampleportal.automation-engine",
    statusOptions: ["ACTIVE", "PAUSED", "ERROR"],
    metricLabel: "Automations in Error",
    fields: [
      { key: "job", label: "Job Name", type: "text", required: true, placeholder: "Sync Appfolio rent roll" },
      { key: "module", label: "Module", type: "select", options: ["Appfolio", "KPI", "Documents", "Lending", "Mission Control"], defaultValue: "KPI" },
      { key: "schedule", label: "Schedule", type: "text", placeholder: "0 */4 * * *" },
      { key: "owner", label: "Owner", type: "text", defaultValue: "Marcus" },
      { key: "lastRun", label: "Last Run Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["ACTIVE", "PAUSED", "ERROR"], defaultValue: "ACTIVE" },
    ],
    columns: [
      { key: "job", label: "Job" },
      { key: "module", label: "Module" },
      { key: "schedule", label: "Schedule" },
      { key: "owner", label: "Owner" },
      { key: "lastRun", label: "Last Run", format: "date" },
      { key: "status", label: "Status", format: "status" },
    ],
    seedRows: [
      { id: "ae1", job: "Sync Appfolio summary", module: "Appfolio", schedule: "0 */4 * * *", owner: "Marcus", lastRun: "2026-02-19", status: "ACTIVE", updatedAt: "2026-02-19" },
      { id: "ae2", job: "Rebuild KPI rollups", module: "KPI", schedule: "*/30 * * * *", owner: "Codex", lastRun: "2026-02-19", status: "ERROR", updatedAt: "2026-02-19" },
    ],
  },
};

export function isDemoModuleKey(key: ModuleKey): key is DemoModuleKey {
  return key in demoModuleConfigs;
}

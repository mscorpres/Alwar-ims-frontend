// keep in sync with backend routes/INVENTORY/productDevelopment/pdTracker.js
export const STATUS = {
  sample: ["Not requested", "Requested", "Received", "Approved", "Rejected"],
  qc: ["Pending", "In progress", "Conditional pass", "Pass", "Fail"],
  price: ["Awaiting quote", "Quoted", "Negotiating", "Approved", "Rejected"],
  tracking: ["In progress", "Closed"],
};

export const STATUS_LABEL = {
  sample: "Sample status",
  qc: "QC status",
  price: "Price status",
  tracking: "Tracking",
};

// index in STATUS list -> tone, so every status list reads the same way
const TONES = ["default", "processing", "warning", "success", "error"];
export const statusColor = (field, value) => {
  if (field === "tracking") return value === "Closed" ? "success" : "processing";
  const i = STATUS[field]?.indexOf(value);
  return i >= 0 ? TONES[i] : "default";
};

// pill / bar colours per tone
export const TONE_STYLE = {
  default: { bg: "#ececec", fg: "#555", bar: "#b4b9b6" },
  processing: { bg: "#e6edff", fg: "#2349c9", bar: "#6f8de6" },
  warning: { bg: "#fdebd3", fg: "#a35a00", bar: "#d99a2b" },
  success: { bg: "#dff3e6", fg: "#1f7a3e", bar: "#2f9a57" },
  error: { bg: "#fde2e1", fg: "#b42318", bar: "#e0574f" },
};
export const toneOf = (field, value) => TONE_STYLE[statusColor(field, value)];

export const CLEARED = { sample: ["Approved"], qc: ["Pass", "Conditional pass"], price: ["Approved"] };

export const toOptions = (list) => list.map((v) => ({ label: v, value: v }));

export const PROOF_KINDS = ["Sample", "QC", "Price", "Other"];
// keep in sync with backend: an item with proofs uploaded can never be closed
export const PROOF_CLOSE_MSG = "This item has proofs uploaded, so it cannot be closed";

export const COLS = [
  { k: "project", label: "Project" },
  { k: "sku", label: "SKU" },
  { k: "item", label: "Item" },
  { k: "category", label: "Category" },
  { k: "spec", label: "Spec" },
  { k: "sample", label: "Sample status" },
  { k: "qc", label: "QC status" },
  { k: "price", label: "Price status" },
  { k: "approvedPrice", label: "Approved price" },
  { k: "tracking", label: "Tracking" },
  { k: "remark", label: "Remarks" },
  { k: "purchaser", label: "Purchaser" },
  { k: "pm", label: "Project manager" },
  { k: "enteredBy", label: "Email" },
];

// header aliases used while importing excel / csv / pasted rows
export const ALIASES = {
  project: ["project", "projectname", "product"],
  sku: ["sku", "skucode", "partno", "partnumber", "itemcode", "code"],
  item: ["item", "itemname", "itemdescription", "description", "component", "part"],
  category: ["category", "cat", "type"],
  spec: ["spec", "specs", "specification", "specifications"],
  sample: ["samplestatus", "sample"],
  qc: ["qcstatus", "qc", "qualitystatus"],
  price: ["pricestatus"],
  approvedPrice: ["approvedprice", "approvedpriceinr", "approvedpricers", "finalprice", "approvedrate"],
  purchaser: ["purchaser", "buyer", "purchaseby"],
  pm: ["projectmanager", "pm", "manager"],
  enteredBy: ["enteredby", "enteredbyemail", "email", "notifyemail", "emailid"],
  tracking: ["tracking", "trackingstatus", "state"],
  remark: ["remark", "remarks", "comment", "comments", "note", "notes"],
};

export const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z]/g, "");

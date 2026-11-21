import { useEffect, useState } from "react";
import { Tag, Tooltip } from "antd";
import { imsAxios } from "../../axiosInterceptor";

// keep in sync with backend routes/INVENTORY/partCode/partCode.js
export const REQUEST_STATUS = {
  SUBMITTED: { label: "Submitted", color: "processing" },
  SERIAL_ASSIGNED: { label: "Serial assigned", color: "success" },
  CREATED_IN_IMS: { label: "Created in IMS", color: "green" },
  REJECTED: { label: "Rejected", color: "error" },
};
export const StatusTag = ({ status }) => (
  <Tag color={REQUEST_STATUS[status]?.color}>{REQUEST_STATUS[status]?.label || status}</Tag>
);

export const GRADES = [
  { value: "A", label: "A · General" },
  { value: "B", label: "B · Special project" },
];

// same tile colours as the spec
const PARTS = [
  { key: "cls", label: "Class", color: "#3d6a8c", width: 1 },
  { key: "type", label: "Type", color: "#1b7a4e", width: 1 },
  { key: "bucket", label: "Bucket", color: "#a85a1e", width: 1 },
  { key: "category", label: "Category", color: "#7a5c9a", width: 2 },
  { key: "serial", label: "Serial", color: "#5b6a62", width: 3 },
  { key: "grade", label: "Grade", color: "#b07d00", width: 1 },
];

// value per tile; empty tiles render as a dot so the 9 character shape is always visible
export function CodeTiles({ value = {}, hints = {}, size = "large" }) {
  const big = size === "large";
  return (
    <div style={{ display: "flex", gap: big ? 8 : 4, flexWrap: "wrap" }}>
      {PARTS.map((p) => (
        <Tooltip key={p.key} title={hints[p.key]}>
          <div
            style={{
              background: p.color,
              opacity: value[p.key] ? 1 : 0.35,
              color: "#fff",
              borderRadius: 6,
              minWidth: (big ? 34 : 22) * p.width + (big ? 22 : 12),
              padding: big ? "10px 8px 6px" : "4px 6px 2px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: big ? 26 : 14, letterSpacing: 2, lineHeight: 1.1 }}>
              {value[p.key] || "·".repeat(p.width)}
            </div>
            <div style={{ fontSize: big ? 11 : 9, opacity: 0.9 }}>{p.label}</div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}

// "PE101---A" / "PE101005A" -> tile values
export const tilesFromCode = (code = "") =>
  code.length === 9 ? { cls: code[0], type: code[1], bucket: code[2], category: code.slice(3, 5), serial: code.slice(5, 8), grade: code[8] } : {};

export function usePartCodeMaster() {
  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const response = await imsAxios.get("/partCode/master");
    setLoading(false);
    if (response.success) setMaster(response.data);
  };
  useEffect(() => {
    load();
  }, []);
  return { master, loading, reload: load };
}

export const classLabel = (c) => (c.code === "AM" ? "Online" : c.code);

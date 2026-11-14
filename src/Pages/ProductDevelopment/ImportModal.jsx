import { useState } from "react";
import { Alert, Input, Modal, Table, Typography, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import { ALIASES, COLS, norm } from "./constants";

const parseDelimited = (text) => {
  const delim = text.split("\n")[0].includes("\t") ? "\t" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim()));
};

// first row is the header; map each header to a tracker field through ALIASES
const toItems = (table) => {
  if (table.length < 2) return { items: [], unknown: [] };
  const lookup = {};
  Object.entries(ALIASES).forEach(([k, list]) => list.forEach((a) => (lookup[a] = k)));
  const header = table[0].map((h) => lookup[norm(h)] || null);
  const unknown = table[0].filter((h, i) => !header[i] && String(h).trim());
  const items = table.slice(1).map((r) => {
    const obj = {};
    header.forEach((k, i) => {
      if (k && r[i] !== undefined && String(r[i]).trim() !== "") obj[k] = String(r[i]).trim();
    });
    return obj;
  });
  return { items, unknown };
};

const readXlsx = async (file) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  const table = [];
  ws.eachRow((row) => {
    const vals = [];
    for (let c = 1; c <= ws.columnCount; c++) {
      const v = row.getCell(c).value;
      vals.push(v && typeof v === "object" ? v.text ?? v.result ?? "" : v ?? "");
    }
    table.push(vals);
  });
  return table;
};

export default function ImportModal({ open, onClose, onDone }) {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [paste, setPaste] = useState("");
  const [loading, setLoading] = useState(false);

  const load = (table) => {
    const r = toItems(table);
    setItems(r.items);
    setUnknown(r.unknown);
    if (!r.items.length) showToast("No rows found. Include the header row.", "error");
  };

  const reset = () => { setItems([]); setUnknown([]); setPaste(""); };

  const beforeUpload = async (file) => {
    try {
      if (/\.xlsx$/i.test(file.name)) load(await readXlsx(file));
      else load(parseDelimited(await file.text()));
    } catch (e) {
      showToast("Could not read this file", "error");
    }
    return false;
  };

  const submit = async () => {
    const invalid = items.findIndex((r) => !r.project || !r.sku);
    if (invalid >= 0) return showToast(`Row ${invalid + 1}: Project and SKU are required`, "error");
    setLoading(true);
    const response = await imsAxios.post("/pdTracker/bulkImport", { rows: items });
    setLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      reset();
      onDone?.();
      onClose();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const usedCols = COLS.filter((c) => items.some((r) => r[c.k] !== undefined));

  return (
    <Modal
      title="Upload items"
      open={open}
      width={900}
      onCancel={() => { reset(); onClose(); }}
      onOk={submit}
      okText={`Import${items.length ? ` ${items.length} rows` : ""}`}
      okButtonProps={{ disabled: !items.length, loading }}
      cancelText="Cancel"
      destroyOnClose
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
        Rows matching an existing item on <b>Project + SKU</b> update that item, other rows are added as new.
        Blank cells never overwrite existing values. Items where sample, QC and price are all cleared move to Completed automatically.
      </Typography.Paragraph>
      <Upload.Dragger accept=".xlsx,.csv,.txt" beforeUpload={beforeUpload} showUploadList={false} maxCount={1}>
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Drop an Excel (.xlsx) or CSV file here</p>
      </Upload.Dragger>
      <Input.TextArea
        style={{ marginTop: 12 }}
        rows={4}
        value={paste}
        placeholder="…or paste rows copied from Excel, including the header row"
        onChange={(e) => setPaste(e.target.value)}
        onBlur={() => paste.trim() && load(parseDelimited(paste))}
      />
      {unknown.length > 0 && (
        <Alert style={{ marginTop: 12 }} type="warning" showIcon message={`Ignored columns: ${unknown.join(", ")}`} />
      )}
      {items.length > 0 && (
        <Table
          style={{ marginTop: 12 }}
          size="small"
          rowKey={(_, i) => i}
          dataSource={items.slice(0, 50)}
          pagination={false}
          scroll={{ x: true, y: 240 }}
          columns={usedCols.map((c) => ({ title: c.label, dataIndex: c.k, ellipsis: true }))}
          footer={() => (items.length > 50 ? `Showing first 50 of ${items.length} rows` : `${items.length} rows`)}
        />
      )}
    </Modal>
  );
}

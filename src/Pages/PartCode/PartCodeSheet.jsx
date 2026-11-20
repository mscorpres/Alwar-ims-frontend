import { useEffect, useMemo, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import { Alert, Badge, Button, Card, Popconfirm, Space, Spin, Tabs, Typography } from "antd";
import { PlusOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import { usePartCodeMaster } from "./shared";

const { Text } = Typography;

const SHEETS = {
  logic: {
    label: "Logic Sheet",
    columns: ["Digit 1 · Class", "Digit 2 · Type of Part", "Digit 3 · Bucket", "Digits 4–5 · Part Category"],
    keys: ["cls", "type", "bucket", "category"],
    help: "Same layout as the Logic Sheet: write the class and type once on the first row of a type, the rows below inherit them. Write cells as \"code - name\", e.g. E - Electronics, 1 - SMD, 01 - Resistor.",
  },
  fixed: {
    label: "Fixed Codes (R&D / Online)",
    columns: ["Group", "Code", "Category name"],
    keys: ["group", "code", "name"],
    help: "Write the group once (e.g. RD - R&D, AM - Online), the rows below inherit it. A new group becomes a new button in Part Class.",
  },
};

const cell = (value = "") => ({ value });
const blank = (cols) => Array.from({ length: cols }, () => cell());

// master -> rows laid out like the Logic Sheet: class/type on the first row, buckets and categories side by side
const logicRows = (master) => {
  const rows = [];
  for (const t of master.types) {
    const n = Math.max(t.buckets.length, t.categories.length, 1);
    for (let i = 0; i < n; i++) {
      const b = t.buckets[i];
      const c = t.categories[i];
      rows.push([cell(i ? "" : t.cls), cell(i ? "" : `${t.code} - ${t.name}`), cell(b ? `${b.code} - ${b.name}` : ""), cell(c ? `${c.code} - ${c.name}` : "")]);
    }
    rows.push(blank(4));
  }
  return rows;
};

const fixedRows = (master) => {
  const rows = [];
  for (const c of master.classes.filter((x) => x.journey === "fixed")) {
    master.fixed.filter((f) => f.cls === c.code).forEach((f, i) => rows.push([cell(i ? "" : `${c.code} - ${c.name}`), cell(f.code), cell(f.name)]));
    rows.push(blank(3));
  }
  return rows;
};

function Sheet({ kind, master, onSaved }) {
  const { showToast } = useToast();
  const def = SHEETS[kind];
  const initial = useMemo(() => (master ? [...(kind === "logic" ? logicRows(master) : fixedRows(master)), ...Array.from({ length: 10 }, () => blank(def.columns.length))] : []), [master, kind]);
  const [data, setData] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(initial);
    setDirty(false);
    setErrors([]);
  }, [initial]);

  const save = async () => {
    const rows = data.map((r) => Object.fromEntries(def.keys.map((k, i) => [k, r[i]?.value ?? ""])));
    setSaving(true);
    const response = await imsAxios.post(`/partCode/sheet/${kind}`, { rows });
    setSaving(false);
    if (response.success) {
      showToast(response.message, "success");
      setErrors([]);
      setDirty(false);
      onSaved();
    } else {
      setErrors(response.data?.errors || []);
      showToast(response.message?.msg || response.message, "error");
    }
  };

  return (
    <>
      <Space style={{ marginBottom: 8 }} wrap>
        <Popconfirm title="Discard unsaved changes?" disabled={!dirty} onConfirm={() => { setData(initial); setDirty(false); setErrors([]); }}>
          <Button icon={<ReloadOutlined />} disabled={!dirty}>Discard changes</Button>
        </Popconfirm>
        <Popconfirm
          title="Save the sheet?"
          description="Rows removed from the sheet are deactivated (old requests keep their names)."
          onConfirm={save}
        >
          <Badge dot={dirty}>
            <Button type="primary" icon={<SaveOutlined />} loading={saving}>Save to database</Button>
          </Badge>
        </Popconfirm>
        <Text type="secondary" style={{ fontSize: 12 }}>{def.help}</Text>
      </Space>
      {errors.length > 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 8 }}
          message={`${errors.length} problem(s) – nothing was saved`}
          description={<div style={{ maxHeight: 120, overflowY: "auto", fontSize: 12 }}>{errors.map((e, i) => <div key={i}>{e}</div>)}</div>}
        />
      )}
      <div style={{ height: "calc(100vh - 330px)", overflow: "auto", border: "1px solid #e5e7e5", borderRadius: 6, background: "#fff" }}>
        <Spreadsheet
          data={data}
          columnLabels={def.columns}
          onChange={(d) => {
            setData(d);
            setDirty(true);
          }}
        />
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          style={{ margin: 8 }}
          onClick={() => setData((d) => [...d, ...Array.from({ length: 10 }, () => blank(def.columns.length))])}
        />
      </div>
    </>
  );
}

export default function PartCodeSheet() {
  const { master, loading, reload } = usePartCodeMaster();
  return (
    <div style={{ height: "calc(100vh - 135px)", overflowY: "auto", background: "#f6f7f6" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 20px" }}>
        <Typography.Title level={4} style={{ margin: "0 0 2px" }}>Part Code Sheet</Typography.Title>
        <Text type="secondary">Master data behind the Part Code Creator dropdowns. Edit like Excel (copy / paste works), then save.</Text>
        <Card size="small" style={{ borderRadius: 8, marginTop: 16 }}>
          <Spin spinning={loading}>
            <Tabs
              destroyInactiveTabPane
              items={Object.entries(SHEETS).map(([key, s]) => ({ key, label: s.label, children: <Sheet kind={key} master={master} onSaved={reload} /> }))}
            />
          </Spin>
        </Card>
      </div>
    </div>
  );
}

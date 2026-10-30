import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Popconfirm, Progress, Row, Select, Space, Switch, Table, Tag, Tooltip, Typography } from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import { downloadCSV } from "../../Components/exportToCSV";
import AddItemModal from "./AddItemModal";
import ImportModal from "./ImportModal";
import ItemDrawer from "./ItemDrawer";
import { CLEARED, COLS, PROOF_CLOSE_MSG, STATUS, STATUS_LABEL, toneOf } from "./constants";

const { Text } = Typography;

const cardStyle = { borderRadius: 8, height: "100%" };
const kpiLabel = { fontSize: 11, letterSpacing: 1, color: "#666", textTransform: "uppercase" };

// coloured pill that is also a dropdown, so status changes straight from the grid
function StatusPill({ field, value, disabled, blocked = [], onChange }) {
  const tone = toneOf(field, value);
  return (
    <div style={{ background: tone.bg, borderRadius: 14, minWidth: 110 }}>
      <Select
        size="small"
        variant="borderless"
        value={value}
        disabled={disabled}
        suffixIcon={null}
        popupMatchSelectWidth={false}
        style={{ width: "100%", textAlign: "center" }}
        labelRender={({ value: v }) => <span style={{ color: tone.fg, fontWeight: 600, fontSize: 12 }}>{v}</span>}
        onChange={onChange}
        options={STATUS[field].map((s) => ({
          value: s,
          disabled: blocked.includes(s),
          title: blocked.includes(s) ? PROOF_CLOSE_MSG : s,
          label: <span style={{ color: toneOf(field, s).fg }}>{s}</span>,
        }))}
      />
    </div>
  );
}

function StackedBar({ field, items, active, onPick }) {
  const counts = STATUS[field].map((s) => [s, items.filter((r) => r[field] === s).length]).filter(([, n]) => n);
  return (
    <div style={{ marginBottom: 16 }}>
      <Row justify="space-between">
        <Text strong style={{ fontSize: 12 }}>{STATUS_LABEL[field]}</Text>
        <Text type="secondary" style={{ fontSize: 12, fontFamily: "monospace" }}>{items.length} items</Text>
      </Row>
      <div style={{ display: "flex", height: 10, borderRadius: 3, overflow: "hidden", margin: "6px 0", background: "#f0f0f0" }}>
        {counts.map(([s, n]) => (
          <Tooltip key={s} title={`${s}: ${n}`}>
            <div onClick={() => onPick(field, s)} style={{ width: `${(n / items.length) * 100}%`, background: toneOf(field, s).bar, cursor: "pointer" }} />
          </Tooltip>
        ))}
      </div>
      <Space size={12} wrap>
        {counts.map(([s, n]) => (
          <span
            key={s}
            onClick={() => onPick(field, s)}
            style={{ fontSize: 12, cursor: "pointer", fontWeight: active === s ? 700 : 400, textDecoration: active === s ? "underline" : "none" }}
          >
            <span style={{ display: "inline-block", width: 8, height: 8, background: toneOf(field, s).bar, marginRight: 4 }} />
            {s} <b>{n}</b>
          </span>
        ))}
      </Space>
    </div>
  );
}

export default function ProductDevelopment() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [hideClosed, setHideClosed] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const load = async () => {
    setLoading(true);
    const response = await imsAxios.post("/pdTracker/list", { tracking: "all" });
    setLoading(false);
    if (response.success) setRows(response.data);
    else {
      setRows([]);
      showToast(response.message?.msg || response.message, "error");
    }
  };
  useEffect(() => { load(); }, []);

  const update = async (row, data) => {
    setSavingKey(row.item_key);
    const response = await imsAxios.post("/pdTracker/update", { item_key: row.item_key, ...data });
    setSavingKey(null);
    if (response.success) {
      showToast(response.message, "success");
      load();
    } else showToast(response.message?.msg || response.message, "error");
  };

  const remove = async (row) => {
    const response = await imsAxios.post("/pdTracker/delete", { item_key: row.item_key });
    if (response.success) { showToast(response.message, "success"); load(); }
    else showToast(response.message?.msg || response.message, "error");
  };

  const uniq = (k) => [...new Set(rows.map((r) => r[k]).filter(Boolean))].sort();
  const projects = useMemo(() => uniq("project"), [rows]);
  const purchasers = useMemo(() => uniq("purchaser"), [rows]);
  const managers = useMemo(() => uniq("pm"), [rows]);

  const view = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (!hideClosed || r.tracking !== "Closed") &&
      Object.entries(filters).every(([k, v]) => !v || r[k] === v) &&
      (!q || [r.sku, r.item, r.spec, r.category, r.project].some((x) => String(x || "").toLowerCase().includes(q)))
    );
  }, [rows, filters, search, hideClosed]);

  const setFilter = (k, v) => setFilters((p) => ({ ...p, [k]: p[k] === v ? undefined : v }));

  const closed = rows.filter((r) => r.tracking === "Closed");
  const kpis = [
    ["Items", rows.length, `in ${projects.length} projects`],
    ["In progress", rows.length - closed.length, null],
    ["Closed", closed.length, `${rows.filter((r) => r.cleared).length} fully cleared`],
    ["Samples not approved", rows.filter((r) => r.sample !== "Approved").length, null],
    ["QC failed", rows.filter((r) => r.qc === "Fail").length, null],
    ["Price not approved", rows.filter((r) => r.price !== "Approved").length, null],
  ];

  const clearance = useMemo(
    () =>
      projects.map((p) => {
        const list = rows.filter((r) => r.project === p);
        return {
          project: p,
          pm: [...new Set(list.map((r) => r.pm).filter(Boolean))].join(", "),
          total: list.length,
          sample: list.filter((r) => CLEARED.sample.includes(r.sample)).length,
          qc: list.filter((r) => CLEARED.qc.includes(r.qc)).length,
          price: list.filter((r) => CLEARED.price.includes(r.price)).length,
          cleared: list.filter((r) => r.cleared).length,
        };
      }),
    [rows, projects]
  );

  const sorter = (k) => (a, b) => String(a[k] ?? "").localeCompare(String(b[k] ?? ""), undefined, { numeric: true });
  const pill = (field) => ({
    title: STATUS_LABEL[field],
    dataIndex: field,
    width: 150,
    sorter: sorter(field),
    render: (v, row) => (
      <StatusPill
        field={field}
        value={v}
        disabled={savingKey === row.item_key}
        blocked={field === "tracking" && row.proofCount > 0 && row.tracking !== "Closed" ? ["Closed"] : []}
        onChange={(nv) => update(row, { [field]: nv })}
      />
    ),
  });
  const ellipsis = (title, k, width, extra = {}) => ({ title, dataIndex: k, width, ellipsis: { showTitle: true }, sorter: sorter(k), ...extra });

  const columns = [
    ellipsis("Project", "project", 120, { fixed: "left" }),
    ellipsis("SKU", "sku", 110, { render: (v) => <span style={{ fontFamily: "monospace" }}>{v}</span> }),
    ellipsis("Item", "item", 150),
    ellipsis("Category", "category", 110),
    ellipsis("Spec", "spec", 150),
    pill("sample"),
    pill("qc"),
    pill("price"),
    { title: "Approved price (₹)", dataIndex: "approvedPrice", width: 130, align: "right", sorter: (a, b) => Number(a.approvedPrice || 0) - Number(b.approvedPrice || 0) },
    pill("tracking"),
    ellipsis("Remarks", "remark", 160),
    ellipsis("Purchaser", "purchaser", 110),
    ellipsis("Project manager", "pm", 130),
    {
      title: "Proofs",
      width: 150,
      render: (_, row) => (
        <Space size={4}>
          {[["Sample", "S"], ["QC", "QC"], ["Price", "₹"]].map(([k, label]) => {
            const n = row.proofs?.[k] || 0;
            return (
              <Tooltip key={k} title={`${k} proof${n ? `: ${n}` : " not uploaded"}`}>
                <span
                  onClick={() => setDrawer({ key: row.item_key, tab: "proofs" })}
                  style={{
                    fontSize: 11, padding: "0 5px", borderRadius: 3, cursor: "pointer",
                    border: n ? "1px solid #2f9a57" : "1px dashed #d99a2b",
                    background: n ? "#dff3e6" : "transparent", color: n ? "#1f7a3e" : "#a35a00",
                  }}
                >
                  {label}
                </span>
              </Tooltip>
            );
          })}
          <Button size="small" onClick={() => setDrawer({ key: row.item_key, tab: "details" })}>View</Button>
        </Space>
      ),
    },
    {
      title: "",
      width: 44,
      fixed: "right",
      render: (_, row) => (
        <Popconfirm title="Delete this item?" onConfirm={() => remove(row)}>
          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const exportCsv = () =>
    downloadCSV(view, COLS.map((c) => ({ headerName: c.label, field: c.k })), "Product Development Tracker");

  const activeStatus = ["sample", "qc", "price"].filter((f) => filters[f]);
  const drawerItem = drawer ? rows.find((r) => r.item_key === drawer.key) || null : null;

  return (
    <div style={{ height: "calc(100vh - 135px)", overflowY: "auto", background: "#f6f7f6" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 20px" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>Product Development Tracker</Typography.Title>
            <Text type="secondary">{rows.length} items across {projects.length} projects · sampling, QC and price approval</Text>
          </Col>
          <Space wrap>
            <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!view.length}>Export view (CSV)</Button>
            <Button icon={<UploadOutlined />} onClick={() => setShowImport(true)}>Upload / paste</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>Add item</Button>
          </Space>
        </Row>

        <Card size="small" style={{ borderRadius: 8, marginBottom: 16 }}>
          <Row>
            {kpis.map(([label, value, sub]) => (
              <Col key={label} flex="1">
                <div style={kpiLabel}>{label}</div>
                <span style={{ fontSize: 24, fontWeight: 600 }}>{value}</span>{" "}
                {sub && <Text type="secondary" style={{ fontSize: 12 }}>{sub}</Text>}
              </Col>
            ))}
          </Row>
        </Card>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={10}>
            <Card
              size="small"
              style={cardStyle}
              title="Status breakdown"
              extra={<Text type="secondary" style={{ fontSize: 12 }}>Click a status to filter the grid</Text>}
            >
              {rows.length ? (
                ["sample", "qc", "price"].map((f) => <StackedBar key={f} field={f} items={rows} active={filters[f]} onPick={setFilter} />)
              ) : (
                <Text type="secondary">No items yet</Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card
              size="small"
              style={cardStyle}
              title="Clearance by project"
              extra={<Text type="secondary" style={{ fontSize: 12 }}>Cleared = sample approved, QC passed, price approved</Text>}
            >
              <Table
                size="small"
                rowKey="project"
                pagination={false}
                dataSource={clearance}
                onRow={(r) => ({ onClick: () => setFilter("project", r.project), style: { cursor: "pointer" } })}
                columns={[
                  { title: "Project", dataIndex: "project", render: (v) => <b>{v}</b> },
                  { title: "PM", dataIndex: "pm", ellipsis: true },
                  { title: "Items", dataIndex: "total", width: 60 },
                  { title: "Sample ✓", width: 80, render: (_, r) => `${r.sample}/${r.total}` },
                  { title: "QC ✓", width: 60, render: (_, r) => `${r.qc}/${r.total}` },
                  { title: "Price ✓", width: 70, render: (_, r) => `${r.price}/${r.total}` },
                  {
                    title: "Cleared",
                    width: 170,
                    render: (_, r) => <Progress size="small" strokeColor="#2f9a57" percent={Math.round((r.cleared / r.total) * 100)} />,
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={8} align="middle" style={{ marginBottom: 8 }}>
          <Col flex="auto">
            <Input allowClear placeholder="Search SKU, item, spec, category…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Col>
          <Col>
            <Select allowClear placeholder="All projects" style={{ width: 150 }} value={filters.project} onChange={(v) => setFilters((p) => ({ ...p, project: v }))} options={projects.map((v) => ({ value: v, label: v }))} />
          </Col>
          <Col>
            <Select allowClear placeholder="All purchasers" style={{ width: 150 }} value={filters.purchaser} onChange={(v) => setFilters((p) => ({ ...p, purchaser: v }))} options={purchasers.map((v) => ({ value: v, label: v }))} />
          </Col>
          <Col>
            <Select allowClear placeholder="All project managers" style={{ width: 170 }} value={filters.pm} onChange={(v) => setFilters((p) => ({ ...p, pm: v }))} options={managers.map((v) => ({ value: v, label: v }))} />
          </Col>
          <Col>
            <Space size={4}>
              <Switch size="small" checked={hideClosed} onChange={setHideClosed} />
              <Text style={{ fontSize: 12 }}>Hide closed</Text>
            </Space>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontFamily: "monospace", fontSize: 12 }}>{view.length} items</Text>
          </Col>
        </Row>
        {activeStatus.length > 0 && (
          <Space style={{ marginBottom: 8 }}>
            {activeStatus.map((f) => (
              <Tag key={f} closable onClose={() => setFilter(f, filters[f])}>{STATUS_LABEL[f]}: {filters[f]}</Tag>
            ))}
            <Button size="small" type="link" onClick={() => { setFilters({}); setSearch(""); }}>Clear filters</Button>
          </Space>
        )}

        <Card size="small" style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
          <Table
            size="middle"
            rowKey="item_key"
            loading={loading}
            dataSource={view}
            columns={columns}
            scroll={{ x: 2000 }}
            pagination={{ pageSize: 50, hideOnSinglePage: true, showSizeChanger: false }}
          />
        </Card>
      </div>

      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onDone={load} />
      <ImportModal open={showImport} onClose={() => setShowImport(false)} onDone={load} />
      <ItemDrawer item={drawerItem} initialTab={drawer?.tab} onClose={() => setDrawer(null)} onSaved={load} />
    </div>
  );
}

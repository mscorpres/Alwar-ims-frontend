import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Button, Card, Col, Empty, Form, Input, Modal, Radio, Row, Segmented, Select, Space, Spin, Table, Tooltip, Typography,
} from "antd";
import { CopyOutlined, SendOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import { CodeTiles, GRADES, StatusTag, classLabel, tilesFromCode, usePartCodeMaster } from "./shared";

const { Text } = Typography;
const label = { fontSize: 11, letterSpacing: 1, color: "#5b6a62", fontWeight: 600 };

function SimilarWarning({ list }) {
  if (!list?.length) return null;
  const exact = list.filter((s) => s.exact);
  return (
    <Alert
      type={exact.length ? "error" : "warning"}
      showIcon
      style={{ marginBottom: 12 }}
      message={exact.length ? "Exact same part name already exists" : "Similar name found"}
      description={
        <div style={{ fontSize: 12 }}>
          {list.map((s, i) => (
            <div key={i}>
              <b style={{ fontFamily: "monospace" }}>{s.code || "—"}</b> – {s.part_name}{" "}
              <Text type="secondary">({s.exact ? "exact" : `${Math.round(s.score * 100)}%`} · {s.source}{s.ims_item_code ? ` · ${s.ims_item_code}` : ""})</Text>
            </div>
          ))}
        </div>
      }
    />
  );
}

export default function PartCodeRequest() {
  const { showToast } = useToast();
  const { master, loading: masterLoading } = usePartCodeMaster();
  const [sel, setSel] = useState({ cls: "P", grade: "A" });
  const [partName, setPartName] = useState("");
  const [fixedCode, setFixedCode] = useState(null);
  const [existing, setExisting] = useState({ rows: [], total: 0, loading: false });
  const [similar, setSimilar] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState([]);
  const [mineLoading, setMineLoading] = useState(false);
  const timer = useRef();

  const cls = master?.classes.find((c) => c.code === sel.cls);
  const isFixed = cls?.journey === "fixed";
  const types = useMemo(() => master?.types.filter((t) => t.cls === sel.cls) || [], [master, sel.cls]);
  const type = types.find((t) => t.code === sel.type);
  const fixedList = master?.fixed.filter((f) => f.cls === sel.cls) || [];

  // a type with a single bucket (consumables = 0) is pre-selected and locked
  useEffect(() => {
    if (type?.buckets.length === 1 && sel.bucket !== type.buckets[0].code) setSel((s) => ({ ...s, bucket: type.buckets[0].code }));
  }, [type]);

  const logic = !isFixed && sel.cls && sel.type && sel.bucket && sel.category && sel.grade ? `${sel.cls}${sel.type}${sel.bucket}${sel.category}---${sel.grade}` : null;

  const loadMine = async () => {
    setMineLoading(true);
    const response = await imsAxios.get("/partCode/requests", { params: { mine: 1, status: "ALL" } });
    setMineLoading(false);
    setMine(response.success ? response.data : []);
  };
  useEffect(() => {
    loadMine();
  }, []);

  useEffect(() => {
    if (!logic) return setExisting({ rows: [], total: 0, loading: false });
    let live = true;
    setExisting((e) => ({ ...e, loading: true }));
    imsAxios.get("/partCode/existing", { params: { logic } }).then((response) => {
      if (live) setExisting({ rows: response.success ? response.data : [], total: response.total || 0, loading: false });
    });
    return () => (live = false);
  }, [logic]);

  // similar-name check 200 ms after typing stops
  useEffect(() => {
    clearTimeout(timer.current);
    if (!partName.trim()) return setSimilar([]);
    timer.current = setTimeout(async () => {
      const response = await imsAxios.get("/partCode/similar", { params: { name: partName.trim() } });
      setSimilar(response.success ? response.data : []);
    }, 200);
  }, [partName]);

  const pick = (key, value) =>
    setSel((s) => {
      if (key === "cls") return { cls: value, grade: s.grade };
      if (key === "type") return { ...s, type: value, bucket: undefined, category: undefined };
      return { ...s, [key]: value };
    });

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    showToast(`${text} copied`, "success");
  };

  const submit = async (confirm_duplicate = false) => {
    if (!logic) return showToast("Select class, type, bucket, category and grade", "error");
    if (!partName.trim()) return showToast("Part name is required", "error");
    setSubmitting(true);
    const response = await imsAxios.post("/partCode/requests", { ...sel, part_name: partName, confirm_duplicate });
    setSubmitting(false);
    if (response.success) {
      showToast(response.message, "success");
      setPartName("");
      setSimilar([]);
      loadMine();
    } else if (response.code === "DUPLICATE_NAME") {
      setSimilar(response.data?.similar || []);
      Modal.confirm({
        title: "Exact same part name already exists",
        content: "A part with this name is already in IMS or pending. Submit the request anyway?",
        okText: "Submit anyway",
        onOk: () => submit(true),
      });
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const tiles = isFixed ? tilesFromCode(fixedCode || "") : { ...sel, serial: logic ? "---" : "" };
  const hints = {
    cls: cls?.name,
    type: type?.name,
    bucket: type?.buckets.find((b) => b.code === sel.bucket)?.name,
    category: type?.categories.find((c) => c.code === sel.category)?.name,
    serial: "Filled in by the Accounts / IMS team",
    grade: GRADES.find((g) => g.value === sel.grade)?.label,
  };

  return (
    <div style={{ height: "calc(100vh - 135px)", overflowY: "auto", background: "#f6f7f6" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 20px" }}>
        <Typography.Title level={4} style={{ margin: "0 0 2px" }}>Part Code Creator</Typography.Title>
        <Text type="secondary">Build the part code logic and request a code. The serial is assigned by the Accounts / IMS team.</Text>

        <Spin spinning={masterLoading}>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} lg={10}>
              <Card size="small" style={{ borderRadius: 8, background: "#eef2ef" }}>
                <Form layout="vertical" size="middle">
                  <Form.Item label={<span style={label}>PART CLASS</span>}>
                    <Segmented
                      block
                      value={sel.cls}
                      onChange={(v) => { pick("cls", v); setFixedCode(null); }}
                      options={(master?.classes || []).map((c) => ({ value: c.code, label: <Tooltip title={c.name}>{classLabel(c)}</Tooltip> }))}
                    />
                  </Form.Item>
                  {isFixed ? (
                    <Form.Item label={<span style={label}>CATEGORY NAME</span>} required>
                      <Select
                        placeholder="Select category"
                        value={fixedCode}
                        onChange={setFixedCode}
                        options={fixedList.map((f) => ({ value: f.code, label: f.name }))}
                      />
                    </Form.Item>
                  ) : (
                    <>
                      <Form.Item label={<span style={label}>TYPE OF PART</span>} required>
                        <Select showSearch optionFilterProp="label" placeholder="Select type" value={sel.type} onChange={(v) => pick("type", v)}
                          options={types.map((t) => ({ value: t.code, label: `${t.code} – ${t.name}` }))} />
                      </Form.Item>
                      <Form.Item label={<span style={label}>SPECIFIC BUCKET</span>} required>
                        <Select placeholder="Select bucket" value={sel.bucket} onChange={(v) => pick("bucket", v)} disabled={!type || type.buckets.length === 1}
                          options={(type?.buckets || []).map((b) => ({ value: b.code, label: `${b.code} – ${b.name}` }))} />
                      </Form.Item>
                      <Form.Item label={<span style={label}>PART CATEGORY</span>} required>
                        <Select showSearch optionFilterProp="label" placeholder="Select category" value={sel.category} onChange={(v) => pick("category", v)} disabled={!type}
                          options={(type?.categories || []).map((c) => ({ value: c.code, label: `${c.code} – ${c.name}` }))} />
                      </Form.Item>
                      <Form.Item label={<span style={label}>GRADING</span>} required>
                        <Radio.Group optionType="button" buttonStyle="solid" value={sel.grade} onChange={(e) => pick("grade", e.target.value)} options={GRADES} />
                      </Form.Item>
                      <Form.Item label={<span style={label}>FORMATTED PART NAME</span>} required style={{ marginBottom: 0 }}>
                        <Input.TextArea rows={2} maxLength={255} showCount value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="e.g. Battery Pack 3.7 V 2000 Mah without connector" />
                      </Form.Item>
                    </>
                  )}
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card size="small" style={{ borderRadius: 8, background: "#eef2ef", marginBottom: 16 }}>
                <div style={{ ...label, marginBottom: 10 }}>{isFixed ? "PART CODE" : "PART CODE LOGIC"}</div>
                <CodeTiles value={tiles} hints={isFixed ? {} : hints} />
                <Space style={{ marginTop: 14 }}>
                  {isFixed ? (
                    <>
                      <Text strong style={{ fontFamily: "monospace", fontSize: 18 }}>{fixedCode || "—"}</Text>
                      <Button icon={<CopyOutlined />} disabled={!fixedCode} onClick={() => copy(fixedCode)}>Copy code</Button>
                    </>
                  ) : (
                    <>
                      <Button icon={<CopyOutlined />} disabled={!logic} onClick={() => copy(logic)}>Copy logic</Button>
                      <Button type="primary" icon={<SendOutlined />} loading={submitting} disabled={!logic || !partName.trim()} onClick={() => submit(false)}>
                        Submit request
                      </Button>
                    </>
                  )}
                </Space>
                {isFixed && <div style={{ marginTop: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>R&D and Online codes are fixed – no request is needed.</Text></div>}
              </Card>

              {!isFixed && (
                <Card size="small" style={{ borderRadius: 8, background: "#eef2ef" }}>
                  <div style={{ ...label, marginBottom: 10 }}>EXISTING PARTS WITH {logic || "THIS LOGIC"}</div>
                  <SimilarWarning list={similar} />
                  {!logic ? (
                    <Text type="secondary">Complete the selections to see parts in this series.</Text>
                  ) : (
                    <Table
                      size="small"
                      rowKey="code"
                      loading={existing.loading}
                      dataSource={existing.rows}
                      pagination={{ pageSize: 8, hideOnSinglePage: true, size: "small" }}
                      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No parts in this series yet – the first code will be 001" /> }}
                      columns={[
                        { title: "Code", dataIndex: "code", width: 120, render: (v, r) => <span style={{ fontFamily: "monospace" }}>{v}{r.legacy ? " *" : ""}</span> },
                        { title: "Part name", dataIndex: "part_name", ellipsis: true },
                        { title: "IMS item", dataIndex: "ims_item_code", width: 110 },
                        { title: "", dataIndex: "status", width: 70, render: (v) => (v === "VOID" ? <Text type="danger">VOID</Text> : null) },
                      ]}
                      footer={() => <Text type="secondary" style={{ fontSize: 12 }}>{existing.total} in series{existing.rows.some((r) => r.legacy) ? " · * legacy 8 character code" : ""}</Text>}
                    />
                  )}
                </Card>
              )}
            </Col>
          </Row>
        </Spin>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card size="small" title="My requests" style={{ borderRadius: 8 }} extra={<Button size="small" onClick={loadMine}>Refresh</Button>}>
              <Table
                size="small"
                rowKey="id"
                loading={mineLoading}
                dataSource={mine}
                pagination={{ pageSize: 10, hideOnSinglePage: true, size: "small" }}
                columns={[
                  { title: "#", dataIndex: "id", width: 60 },
                  { title: "Logic", dataIndex: "logic", width: 110, render: (v) => <span style={{ fontFamily: "monospace" }}>{v}</span> },
                  { title: "Part name", dataIndex: "partName", ellipsis: true },
                  { title: "Status", dataIndex: "status", width: 130, render: (v) => <StatusTag status={v} /> },
                  {
                    title: "Code / Reason",
                    width: 200,
                    render: (_, r) =>
                      r.finalCode ? (
                        <Space size={4}>
                          <b style={{ fontFamily: "monospace" }}>{r.finalCode}</b>
                          <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copy(r.finalCode)} />
                        </Space>
                      ) : (
                        <Text type="danger" style={{ fontSize: 12 }}>{r.rejectReason}</Text>
                      ),
                  },
                  { title: "Requested", dataIndex: "requestedAt", width: 130 },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

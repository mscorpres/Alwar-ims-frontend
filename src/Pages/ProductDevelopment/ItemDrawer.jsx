import { useEffect, useState } from "react";
import {
  Button, Col, Drawer, Empty, Form, Image, Input, InputNumber, Popconfirm, Row, Select, Space, Spin, Tabs, Tag, Timeline, Typography, Upload,
} from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import MyButton from "../../Components/MyButton";
import SearchSelect, { fetchUsers } from "./SearchSelect";
import { PROOF_CLOSE_MSG, PROOF_KINDS, STATUS, toOptions } from "./constants";

const FIELD_LABEL = {
  project: "Project", sku: "SKU", item: "Item", category: "Category", spec: "Spec", sample: "Sample status",
  qc: "QC status", price: "Price status", approvedPrice: "Approved price", tracking: "Tracking", remark: "Remarks",
  purchaser: "Purchaser", pm: "Project manager", enteredBy: "Email", created: "Created", deleted: "Deleted", proof: "Proof",
};

function Proofs({ itemKey, onChange }) {
  const { showToast } = useToast();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState("Sample");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const response = await imsAxios.get(`/pdTracker/proofs/${itemKey}`);
    setLoading(false);
    setProofs(response.success ? response.data : []);
  };
  useEffect(() => { load(); }, [itemKey]);

  const upload = async () => {
    const fd = new FormData();
    fd.append("item_key", itemKey);
    fd.append("kind", kind);
    files.forEach((f) => fd.append("files", f));
    setUploading(true);
    const response = await imsAxios.post("/pdTracker/proof/upload", fd);
    setUploading(false);
    if (response.success) {
      showToast(response.message, "success");
      setFiles([]);
      load();
      onChange?.();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const remove = async (proof_key) => {
    const response = await imsAxios.post("/pdTracker/proof/delete", { proof_key });
    if (response.success) { load(); onChange?.(); }
    else showToast(response.message?.msg || response.message, "error");
  };

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select value={kind} onChange={setKind} options={toOptions(PROOF_KINDS)} style={{ width: 120 }} />
        <Upload
          multiple
          accept="image/jpeg,image/png"
          fileList={files.map((f) => ({ uid: f.uid, name: f.name }))}
          beforeUpload={(f) => {
            if (f.size > 20 * 1024 * 1024) { showToast(`${f.name} is larger than 20 MB`, "error"); return Upload.LIST_IGNORE; }
            setFiles((p) => [...p, f]);
            return false;
          }}
          onRemove={(f) => setFiles((p) => p.filter((x) => x.uid !== f.uid))}
        >
          <Button icon={<UploadOutlined />}>Select images</Button>
        </Upload>
        <Button type="primary" disabled={!files.length} loading={uploading} onClick={upload}>Upload</Button>
      </Space>
      <Spin spinning={loading}>
        {!proofs.length && !loading && <Empty description="No proofs yet" />}
        {PROOF_KINDS.map((k) => {
          const list = proofs.filter((p) => p.kind === k);
          if (!list.length) return null;
          return (
            <div key={k} style={{ marginBottom: 16 }}>
              <Typography.Text strong>{k} ({list.length})</Typography.Text>
              <Image.PreviewGroup>
                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  {list.map((p) => (
                    <Col key={p.proof_key} span={8}>
                      <Image src={p.url} height={110} width="100%" style={{ objectFit: "cover", borderRadius: 4 }} />
                      <Row justify="space-between" align="middle">
                        <Typography.Text type="secondary" style={{ fontSize: 11 }} ellipsis>{p.uploaded_by} · {p.uploaded_at}</Typography.Text>
                        <Popconfirm title="Delete this proof?" onConfirm={() => remove(p.proof_key)}>
                          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Row>
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          );
        })}
      </Spin>
    </>
  );
}

function History({ itemKey }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const response = await imsAxios.get(`/pdTracker/logs/${itemKey}`);
      setLoading(false);
      setLogs(response.success ? response.data : []);
    })();
  }, [itemKey]);

  return (
    <Spin spinning={loading}>
      {!logs.length && !loading && <Empty />}
      <Timeline
        items={logs.map((l) => ({
          color: l.field_name === "tracking" ? (l.new_value === "Closed" ? "green" : "blue") : "gray",
          children: (
            <>
              <Typography.Text strong>{FIELD_LABEL[l.field_name] || l.field_name}</Typography.Text>{" "}
              {l.field_name === "created" || l.field_name === "proof" || l.field_name === "deleted" ? (
                <span>{l.new_value || l.old_value}</span>
              ) : (
                <span>
                  <Tag>{l.old_value || "—"}</Tag>→<Tag color="blue">{l.new_value || "—"}</Tag>
                </span>
              )}
              <div style={{ fontSize: 11, color: "#888" }}>{l.changed_by} · {l.changed_at}</div>
            </>
          ),
        }))}
      />
    </Spin>
  );
}

export default function ItemDrawer({ item, initialTab, onClose, onSaved }) {
  const [form] = Form.useForm();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("details");

  useEffect(() => {
    if (item) {
      form.setFieldsValue({ ...item, approvedPrice: item.approvedPrice === "" ? null : item.approvedPrice });
      setTab(initialTab || "details");
    }
  }, [item?.item_key]);

  const save = async (values) => {
    const payload = { ...values, approvedPrice: values.approvedPrice ?? "", item_key: item.item_key };
    // send the PM only when it was changed, so an unlinked imported name isn't wiped
    if ((values.pmId || "") === (item.pmId || "")) delete payload.pmId;
    setSaving(true);
    const response = await imsAxios.post("/pdTracker/update", payload);
    setSaving(false);
    if (response.success) {
      showToast(response.message, "success");
      onSaved?.();
      onClose();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  return (
    <Drawer
      open={!!item}
      onClose={onClose}
      width={620}
      title={item ? `${item.sku} · ${item.item || ""}` : ""}
      extra={item && <Tag color={item.tracking === "Closed" ? "success" : "processing"}>{item.tracking}</Tag>}
      destroyOnClose
    >
      {item && (
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: "details",
              label: "Details",
              children: (
                <Form form={form} layout="vertical" size="small" onFinish={save}>
                  <Row gutter={12}>
                    <Col span={12}><Form.Item name="project" label="Project" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="sku" label="SKU" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="item" label="Item"><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="category" label="Category"><Input /></Form.Item></Col>
                    <Col span={24}><Form.Item name="spec" label="Spec"><Input.TextArea rows={2} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="sample" label="Sample status"><Select options={toOptions(STATUS.sample)} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="qc" label="QC status"><Select options={toOptions(STATUS.qc)} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="price" label="Price status"><Select options={toOptions(STATUS.price)} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="approvedPrice" label="Approved price (₹)"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
                    <Col span={12}>
                      <Form.Item
                        name="tracking"
                        label="Tracking"
                        extra={item.proofCount > 0 && item.tracking !== "Closed" ? PROOF_CLOSE_MSG : null}
                      >
                        <Select
                          options={STATUS.tracking.map((s) => ({
                            label: s,
                            value: s,
                            disabled: s === "Closed" && item.proofCount > 0 && item.tracking !== "Closed",
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}><Form.Item name="purchaser" label="Purchaser"><Input /></Form.Item></Col>
                    <Col span={12}>
                      <Form.Item name="pmId" label="Project manager">
                        <SearchSelect
                          key={item.item_key}
                          fetcher={fetchUsers}
                          placeholder={item.pm || "Search user"}
                          initialOptions={item.pmId ? [{ value: item.pmId, label: item.pm }] : []}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}><Form.Item name="enteredBy" label="Email" rules={[{ type: "email" }]}><Input /></Form.Item></Col>
                    <Col span={24}><Form.Item name="remark" label="Remarks"><Input.TextArea rows={2} /></Form.Item></Col>
                  </Row>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
                    Created by {item.insertedBy} on {item.insertDate}
                    {item.updateDate && ` · Last updated by ${item.updatedBy} on ${item.updateDate}`}
                    {item.closedDate && ` · Closed by ${item.closedBy} on ${item.closedDate}`}
                  </Typography.Paragraph>
                  <MyButton variant="save" htmlType="submit" type="primary" loading={saving} text="Save changes" />
                </Form>
              ),
            },
            { key: "proofs", label: `Proofs (${item.proofCount})`, children: <Proofs itemKey={item.item_key} onChange={onSaved} /> },
            { key: "history", label: "History", children: <History itemKey={item.item_key} /> },
          ]}
        />
      )}
    </Drawer>
  );
}

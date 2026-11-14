import { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Drawer, Input, Modal, Popconfirm, Row, Segmented, Space, Spin, Table, Typography } from "antd";
import { CheckOutlined, CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import SearchSelect from "../ProductDevelopment/SearchSelect";
import { CodeTiles, REQUEST_STATUS, StatusTag, tilesFromCode } from "./shared";

const { Text } = Typography;
const label = { fontSize: 11, letterSpacing: 1, color: "#5b6a62", fontWeight: 600 };

const fetchComponents = async (search) => {
  const response = await imsAxios.post("/backend/getComponentByNameAndNo", { search });
  return response?.success ? response.data.map((c) => ({ value: c.id, label: c.text })) : [];
};

function ReviewDrawer({ request, onClose, onDone }) {
  const { showToast } = useToast();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [component, setComponent] = useState(null);

  const load = async () => {
    setLoading(true);
    const response = await imsAxios.get(`/partCode/requests/${request.id}/next-serial`);
    setLoading(false);
    if (response.success) setInfo(response.data);
    else showToast(response.message, "error");
  };
  useEffect(() => {
    if (request) {
      setInfo(null);
      setReason("");
      setComponent(null);
      if (request.status === "SUBMITTED") load();
    }
  }, [request?.id]);

  const assign = async () => {
    setBusy(true);
    const response = await imsAxios.post(`/partCode/requests/${request.id}/assign`, { expected_code: info.suggested });
    setBusy(false);
    if (response.success) {
      showToast(response.message, "success");
      onDone();
      onClose();
    } else if (response.code === "TAKEN" && response.data?.suggested) {
      // someone took the serial first: show the new suggestion and ask again
      setInfo((i) => ({ ...i, suggested: response.data.suggested }));
      showToast(response.message, "error");
    } else {
      showToast(response.message, "error");
      load();
    }
  };

  const reject = async () => {
    if (!reason.trim()) return showToast("Reason is required", "error");
    setBusy(true);
    const response = await imsAxios.post(`/partCode/requests/${request.id}/reject`, { reason });
    setBusy(false);
    if (response.success) {
      showToast(response.message, "success");
      setRejecting(false);
      onDone();
      onClose();
    } else showToast(response.message, "error");
  };

  const link = async () => {
    setBusy(true);
    const response = await imsAxios.post(`/partCode/requests/${request.id}/link`, { component_key: component });
    setBusy(false);
    if (response.success) {
      showToast(response.message, "success");
      onDone();
      onClose();
    } else showToast(response.message, "error");
  };

  return (
    <Drawer open={!!request} onClose={onClose} width={560} title={request ? `Request #${request.id}` : ""} extra={request && <StatusTag status={request.status} />} destroyOnClose>
      {request && (
        <Spin spinning={loading}>
          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label="Requested">{request.requestedBy} · {request.requestedAt}</Descriptions.Item>
            <Descriptions.Item label="Part name">{request.partName}</Descriptions.Item>
            <Descriptions.Item label="Logic"><span style={{ fontFamily: "monospace" }}>{request.logic}</span></Descriptions.Item>
            {request.finalCode && <Descriptions.Item label="Final code"><b style={{ fontFamily: "monospace" }}>{request.finalCode}</b> · {request.assignedBy} · {request.assignedAt}</Descriptions.Item>}
            {request.imsItemCode && <Descriptions.Item label="IMS item">{request.imsItemCode}</Descriptions.Item>}
            {request.status === "REJECTED" && <Descriptions.Item label="Rejected">{request.rejectReason} · {request.rejectedBy} · {request.rejectedAt}</Descriptions.Item>}
          </Descriptions>

          {request.status === "SUBMITTED" && info && (
            <>
              <div style={{ ...label, margin: "16px 0 6px" }}>LAST CODE IN SERIES</div>
              <Text style={{ fontFamily: "monospace" }}>{info.last ? `${info.last.code} – ${info.last.part_name}` : "None – this is the first code in the series"}</Text>
              <div style={{ ...label, margin: "16px 0 6px" }}>SUGGESTED CODE</div>
              {info.error ? (
                <Alert type="error" showIcon message={info.error} />
              ) : (
                <CodeTiles value={tilesFromCode(info.suggested)} />
              )}
              {info.similar?.length > 0 && (
                <Alert
                  style={{ marginTop: 16 }}
                  type={info.similar.some((s) => s.exact) ? "error" : "warning"}
                  showIcon
                  message="Similar part names"
                  description={info.similar.map((s, i) => (
                    <div key={i} style={{ fontSize: 12 }}>
                      <b style={{ fontFamily: "monospace" }}>{s.code || "—"}</b> – {s.part_name} <Text type="secondary">({s.exact ? "exact" : `${Math.round(s.score * 100)}%`} · {s.source})</Text>
                    </div>
                  ))}
                />
              )}
              <Space style={{ marginTop: 20 }}>
                <Popconfirm title={`Assign ${info.suggested}?`} onConfirm={assign} disabled={!info.suggested}>
                  <Button type="primary" icon={<CheckOutlined />} loading={busy} disabled={!info.suggested}>Assign {info.suggested}</Button>
                </Popconfirm>
                <Button danger icon={<CloseOutlined />} onClick={() => setRejecting(true)}>Reject…</Button>
              </Space>
            </>
          )}

          {request.status === "SERIAL_ASSIGNED" && (
            <Card size="small" style={{ marginTop: 16 }} title="Link the IMS item made for this code">
              <SearchSelect fetcher={fetchComponents} placeholder="Search component by part no / name" value={component} onChange={setComponent} />
              <Button style={{ marginTop: 10 }} type="primary" icon={<LinkOutlined />} disabled={!component} loading={busy} onClick={link}>
                Link and mark created in IMS
              </Button>
            </Card>
          )}

          <Modal title={`Reject request #${request.id}`} open={rejecting} onCancel={() => setRejecting(false)} onOk={reject} okText="Reject" okButtonProps={{ danger: true, loading: busy }}>
            <Text type="secondary">The reason is shown to the requester.</Text>
            <Input.TextArea style={{ marginTop: 8 }} rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Modal>
        </Spin>
      )}
    </Drawer>
  );
}

export default function PartCodeApproval() {
  const { showToast } = useToast();
  const [status, setStatus] = useState("SUBMITTED");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const response = await imsAxios.get("/partCode/requests", { params: { status, search: search.trim() } });
    setLoading(false);
    if (response.success) setRows(response.data);
    else {
      setRows([]);
      showToast(response.message, "error");
    }
  };
  useEffect(() => {
    load();
  }, [status]);

  return (
    <div style={{ height: "calc(100vh - 135px)", overflowY: "auto", background: "#f6f7f6" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 20px" }}>
        <Typography.Title level={4} style={{ margin: "0 0 2px" }}>Part Code Approval</Typography.Title>
        <Text type="secondary">Review requests, assign the next serial or reject with a reason.</Text>
        <Row justify="space-between" style={{ margin: "16px 0 8px" }} gutter={[8, 8]}>
          <Segmented
            value={status}
            onChange={setStatus}
            options={[...Object.entries(REQUEST_STATUS).map(([value, s]) => ({ value, label: s.label })), { value: "ALL", label: "All" }]}
          />
          <Input.Search allowClear style={{ width: 280 }} placeholder="Request #, logic, code or part name" value={search} onChange={(e) => setSearch(e.target.value)} onSearch={load} />
        </Row>
        <Card size="small" style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
          <Table
            size="middle"
            rowKey="id"
            loading={loading}
            dataSource={rows}
            pagination={{ pageSize: 50, hideOnSinglePage: true }}
            onRow={(r) => ({ onClick: () => setSelected(r), style: { cursor: "pointer" } })}
            columns={[
              { title: "#", dataIndex: "id", width: 70 },
              { title: "Logic", dataIndex: "logic", width: 120, render: (v) => <span style={{ fontFamily: "monospace" }}>{v}</span> },
              { title: "Part name", dataIndex: "partName", ellipsis: true },
              { title: "Requested by", dataIndex: "requestedBy", width: 150 },
              { title: "Requested", dataIndex: "requestedAt", width: 140 },
              { title: "Status", dataIndex: "status", width: 140, render: (v) => <StatusTag status={v} /> },
              { title: "Final code", dataIndex: "finalCode", width: 120, render: (v) => <b style={{ fontFamily: "monospace" }}>{v}</b> },
              { title: "", width: 90, render: (_, r) => <Button size="small" type={r.status === "SUBMITTED" ? "primary" : "default"}>{r.status === "SUBMITTED" ? "Review" : "View"}</Button> },
            ]}
          />
        </Card>
      </div>
      <ReviewDrawer request={selected} onClose={() => setSelected(null)} onDone={load} />
    </div>
  );
}

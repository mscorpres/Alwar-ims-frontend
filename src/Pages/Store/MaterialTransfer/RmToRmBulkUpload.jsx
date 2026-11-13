import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Modal,
  Row,
  Segmented,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";


const PREVIEW_URL = "/godown/previewTransferRM2RM";
const EXCEL_COLUMNS = ["FROMLOCATION", "TOLOCATION", "PARTCODE", "QTY", "COMMENT"];

const downloadTemplate = async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("RM to RM");
  ws.columns = EXCEL_COLUMNS.map((c) => ({ header: c, key: c, width: c === "COMMENT" ? 40 : 18 }));
  ws.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
    cell.alignment = { horizontal: "center" };
  });
  saveAs(new Blob([await wb.xlsx.writeBuffer()]), "RM_to_RM_Bulk_Upload.xlsx");
};

function RmToRmBulkUpload({ open, onClose, onDone }) {
  const { showToast } = useToast();
  const [fileList, setFileList] = useState([]);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const resetAll = () => {
    setFileList([]);
    setRows([]);
    setFilter("all");
  };

  const close = () => {
    resetAll();
    onClose();
  };

  const previewFile = async () => {
    if (!fileList.length) return showToast("Please upload an excel file", "error");

    const formData = new FormData();
    formData.append("file", fileList[0]);

    try {
      setPreviewLoading(true);
      const response = await imsAxios.post(PREVIEW_URL, formData);
      if (response?.success) {
        setRows(
          (response.data || []).map((r, index) => ({
            id: index + 1,
            locationFrom: r.fromLocation?.key,
            locationFromName: r.fromLocation?.name,
            component: r.component?.key,
            partCode: r.component?.partCode,
            componentName: r.component?.partName,
            stockQty: r.available_qty,
            unit: r.unit,
            qty: r.qty,
            locationTo: r.toLocation?.key,
            locationToName: r.toLocation?.name,
            address: r.toLocation?.address,
            avrRate: r.war,
            comment: r.comment || "",
          })),
        );
      } else {
        showToast(response?.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to read excel file",
        "error",
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const rowError = (row) => {
    if (!row.locationFrom) return "Pick location not found";
    if (!row.component) return "Component not found";
    if (!row.locationTo) return "Drop location not found";
    if (row.locationTo == row.locationFrom) return "Both locations same";
    if (!(Number(row.qty) > 0)) return "Invalid qty";
    if (Number(row.qty) > Number(row.stockQty)) return "Qty more than stock";
    return "";
  };

  const errorCount = rows.filter(rowError).length;
  const shownRows = filter === "errors" ? rows.filter(rowError) : rows;
  const currentStep = !rows.length ? 0 : errorCount ? 1 : 2;

  const submit = () => {
    if (errorCount) {
      return showToast("Please fix the rows marked in red before transfer", "error");
    }
    Modal.confirm({
      title: "Are you sure you want to transfer?",
      content: `${rows.length} item(s) will be transferred. Please make sure the values are correct.`,
      okText: "Transfer",
      onOk: transfer,
    });
  };

  const transfer = async () => {
    try {
      setSubmitLoading(true);
      const response = await imsAxios.post("/godown/transferRM2RM", {
        comment: rows.map((row) => row.comment || ""),
        fromlocation: rows.map((row) => row.locationFrom),
        component: rows.map((row) => row.component),
        tolocation: rows.map((row) => row.locationTo),
        qty: rows.map((row) => row.qty),
        rate: rows.map((row) => row.avrRate || 0),
        type: "RM2RM",
      });
      if (response.success) {
        showToast(response.message.toString()?.replaceAll("<br/>", ""), "success");
        onDone?.();
        close();
      } else {
        showToast(response?.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to transfer material",
        "error",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { title: "#", dataIndex: "id", width: 50, fixed: "left" },
  
    { title: "PICK (-) Loc", dataIndex: "locationFromName", width: 130, ellipsis: true },
    {
      title: "Component / Part No.",
      dataIndex: "componentName",
      width: 240,
      render: (v, row) => (
        <div>
          <Typography.Text strong>{row.partCode}</Typography.Text>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>{v}</div>
        </div>
      ),
    },
    {
      title: "Stock QTY",
      dataIndex: "stockQty",
      width: 110,
      align: "right",
      render: (v, row) => `${v ?? "0"} ${row.unit ?? ""}`,
    },
    {
      title: "Transfering QTY",
      dataIndex: "qty",
      width: 130,
      align: "right",
      render: (v, row) => (
        <Typography.Text strong type={Number(v) > Number(row.stockQty) ? "danger" : undefined}>
          {`${v ?? ""} ${row.unit ?? ""}`}
        </Typography.Text>
      ),
    },
    { title: "DROP (+) Loc", dataIndex: "locationToName", width: 130, ellipsis: true },
    {
      title: "WAR",
      dataIndex: "avrRate",
      width: 90,
      align: "right",
      render: (v) => Number(v || 0).toFixed(2),
    },
    { title: "Comment", dataIndex: "comment", width: 180, ellipsis: true },
  ];

  return (
    <Drawer
      title="RM to RM Bulk Upload"
      open={open}
      onClose={close}
      width="100vw"
      destroyOnClose
      styles={{ body: { background: "#f5f7fa", padding: 16 } }}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text type="secondary">
            {rows.length ? `${rows.length - errorCount} of ${rows.length} rows ready` : ""}
          </Typography.Text>
          <Space>
            <Button onClick={close}>Cancel</Button>
            <Button
              type="primary"
              onClick={submit}
              loading={submitLoading}
              disabled={!rows.length || errorCount > 0}
            >
              Transfer{rows.length ? ` ${rows.length} item(s)` : ""}
            </Button>
          </Space>
        </div>
      }
    >
      <Card size="small" style={{ marginBottom: 12 }}>
        <Steps
          size="small"
          current={currentStep}
          status={currentStep === 1 ? "error" : "process"}
          items={[
            { title: "Upload Excel" },
            { title: "Review" },
            { title: "Transfer" },
          ]}
        />
      </Card>

      {!rows.length ? (
        <Card size="small">
          <Row gutter={16}>
            <Col span={15}>
              <Upload.Dragger
                accept=".xlsx,.xls,.csv"
                maxCount={1}
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                onRemove={() => setFileList([])}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag excel file to this area to upload
                </p>
                <p className="ant-upload-hint">Supports .xlsx, .xls and .csv</p>
              </Upload.Dragger>
              <Button
                type="primary"
                block
                style={{ marginTop: 12 }}
                onClick={previewFile}
                loading={previewLoading}
                disabled={!fileList.length}
              >
                Upload & Preview
              </Button>
            </Col>
            <Col span={9}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                File format
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
                The first row must be the header with these columns, one transfer per row.
                Pick and drop locations can be different on every row.
              </Typography.Paragraph>
              <Space size={[4, 8]} wrap style={{ marginBottom: 12 }}>
                {EXCEL_COLUMNS.map((c) => (
                  <Tag key={c} color={c === "COMMENT" ? "default" : "blue"}>
                    {c}
                  </Tag>
                ))}
              </Space>
              <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
                COMMENT is optional.
              </Typography.Paragraph>
              <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
                Download Template
              </Button>
            </Col>
          </Row>
        </Card>
      ) : (
        <>
          <Card size="small" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space>
                <FileExcelOutlined style={{ fontSize: 20, color: "#217346" }} />
                <Typography.Text strong>{fileList[0]?.name}</Typography.Text>
              </Space>
              <Button icon={<ReloadOutlined />} onClick={resetAll}>
                Upload another file
              </Button>
            </div>
          </Card>

        

          {errorCount > 0 && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
              message={`${errorCount} row(s) have errors. Fix them in the excel and upload again to transfer.`}
            />
          )}

          <Card
            size="small"
            title="Preview"
            extra={
              <Segmented
                size="small"
                value={filter}
                onChange={setFilter}
                options={[
                  { label: `All (${rows.length})`, value: "all" },
                  { label: `Errors (${errorCount})`, value: "errors" },
                ]}
              />
            }
          >
            <Table
              size="small"
              bordered
              rowKey="id"
              columns={columns}
              dataSource={shownRows}
              pagination={false}
              rowClassName={(row) => (rowError(row) ? "rm-bulk-error-row" : "")}
              locale={{ emptyText: <Empty description="No rows" /> }}
              scroll={{ x: 1450, y: "calc(100vh - 520px)" }}
            />
          </Card>
        </>
      )}
      <style>{`.rm-bulk-error-row > td { background: #fff1f0 !important; }`}</style>
    </Drawer>
  );
}

export default RmToRmBulkUpload;

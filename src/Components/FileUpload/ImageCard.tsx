import { useState } from "react";
import { Col, Image, Popconfirm, Progress, Tag, Tooltip } from "antd";
import {
  DeleteFilled,
  EyeOutlined,
  FileOutlined,
  UploadOutlined,
} from "@ant-design/icons";


import type { FileUploadItem } from "./types";

interface ImageCardProps {
  item: FileUploadItem;
  accept?: string;
  onDelete: (uid: string) => void;
  onReplace: (uid: string, file: File) => void;
  onRetry: (uid: string) => void;
}

const statusMeta: Record<
  FileUploadItem["status"],
  { color: string; label: string }
> = {
  idle: { color: "default", label: "Pending" },
  uploading: { color: "processing", label: "Uploading" },
  success: { color: "success", label: "Uploaded" },
  error: { color: "error", label: "Failed" },
};

export default function ImageCard({
  item,
  accept,
  onDelete,
  onReplace,
  onRetry,
}: ImageCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = item.type?.startsWith("image/");
  const thumb = item.previewUrl ?? item.url;

  const handleReplaceClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onReplace(item.uid, file);
    };
    input.click();
  };



  return (
    <Col span={24}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 4px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: 6,
            overflow: "hidden",
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {isImage && thumb ? (
            <Image
              src={thumb}
              height={36}
              width={36}
              style={{ objectFit: "cover" }}
              preview={{ visible: previewOpen, onVisibleChange: setPreviewOpen }}
            />
          ) : (
            <FileOutlined style={{ fontSize: 16, color: "#bfbfbf" }} />
          )}
     
        </div>


        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Tooltip title="Preview">
            <EyeOutlined
              onClick={() => isImage && thumb && setPreviewOpen(true)}
              style={{ opacity: isImage && thumb ? 1 : 0.35, fontSize: 13, cursor: "pointer" }}
            />
          </Tooltip>
          <Tooltip title="Replace">
            <UploadOutlined onClick={handleReplaceClick} style={{ fontSize: 13, cursor: "pointer" }} />
          </Tooltip>
          <Popconfirm
            title="Remove this file?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(item.uid)}
          >
            <DeleteFilled style={{ fontSize: 13, cursor: "pointer" }} />
          </Popconfirm>
        </div>
      </div>
    </Col>
  );
}

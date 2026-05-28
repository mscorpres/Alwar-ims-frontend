import { Button, Modal } from "antd";

export default function UpdatePopup({ open, onRefresh }) {
  return (
    <Modal
      title="New Update Available"
      open={open}
      footer={[

        <Button key="refresh" type="primary" onClick={onRefresh}>
          Refresh
        </Button>,
      ]}
      centered
      maskClosable={false}
      closable
    >
      <p>System has been updated. Please refresh.</p>
    </Modal>
  );
}

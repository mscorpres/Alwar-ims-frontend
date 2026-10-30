import { useState } from "react";
import { Col, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import SearchSelect, { fetchByItem, fetchBySku, fetchProjects, fetchUsers } from "./SearchSelect";
import { STATUS, toOptions } from "./constants";

const initialValues = {
  sample: STATUS.sample[0],
  qc: STATUS.qc[0],
  price: STATUS.price[0],
};

export default function AddItemModal({ open, onClose, onDone }) {
  const [form] = Form.useForm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // picking a component from either SKU or Item fills both
  const pickComponent = (opt) => form.setFieldsValue({ sku: opt?.sku, item: opt?.item });

  const finish = async (values) => {
    setLoading(true);
    const response = await imsAxios.post("/pdTracker/create", values);
    setLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      form.resetFields();
      onDone?.();
      onClose();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  return (
    <Modal
      title="Add item"
      open={open}
      width={760}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Add item"
      okButtonProps={{ loading }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="small" initialValues={initialValues} onFinish={finish} preserve={false}>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="project" label="Project" rules={[{ required: true, message: "Please select project" }]}>
              <SearchSelect fetcher={fetchProjects} placeholder="Search project" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sku" label="SKU" rules={[{ required: true, message: "Please select SKU" }]}>
              <SearchSelect fetcher={fetchBySku} placeholder="Search part code" onPick={pickComponent} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="item" label="Item" rules={[{ required: true, message: "Please select item" }]}>
              <SearchSelect fetcher={fetchByItem} placeholder="Search item name" onPick={pickComponent} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="category" label="Category">
              <Input />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="spec" label="Spec">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="sample" label="Sample status">
              <Select options={toOptions(STATUS.sample)} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="qc" label="QC status">
              <Select options={toOptions(STATUS.qc)} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="price" label="Price status">
              <Select options={toOptions(STATUS.price)} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="approvedPrice" label="Approved price (₹)">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="purchaser" label="Purchaser">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="pmId" label="Project manager" extra="Status update mails go to this user">
              <SearchSelect fetcher={fetchUsers} placeholder="Search user" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="enteredBy" label="Email" rules={[{ type: "email", message: "Invalid email" }]}>
              <Input placeholder="name@company.com" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remark" label="Remarks">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

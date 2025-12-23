import { Button, Card, Col, Form, Input, Row } from "antd";
import React from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";

function QaProcess() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const addRows = async (values) => {
    setLoading(true);
    const response = await imsAxios.post("/qaProcessmaster/insert_Process", values);
    if (response.success) {
      showToast(response.message, "success");
      getRows();
      form.resetFields();
    }
    else{
      showToast(response.message, "error");
    }
    setLoading(false);
  };
  const getRows = async () => {
    const response = await imsAxios.get("/qaProcessmaster/fetch_Process");
    if (response.success) {
      const data = response.data;
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    }
  };
  const submitForm = async () => {
    const values = await form.validateFields();
    addRows(values);
  };
  const columns = [
    {
      headerName: "Index",
      field: "index",
      width: 100,
    },
    {
      headerName: "Process Code",
      field: "process_code",
      flex: 1,
    },
    {
      headerName: "Process Name",
      field: "process_name",
      flex: 1,
    },
    {
      headerName: "Process Decsription",
      field: "process_desc",
      flex: 1,
    },
  ];
  useEffect(() => {
    getRows();
  }, []);

  return (
    <div>
      <Row gutter={10} span={24}>
        <Col span={8}>
          <Card>
            <Form form={form} size="small" layout="vertical">
              <Form.Item
                name="processName"
                label="Process Name"
                rules={rules.processName}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="processDesc"
                label="Process Description"
                rules={rules.processDesc}
              >
                <Input />
              </Form.Item>
            </Form>
            <Row justify="end">
              <Col span={4}>
                <Button>Reset</Button>
              </Col>
              <Col span={4}>
                <MyButton variant="search" type="primary" onClick={submitForm} loading={loading}>
                  Submit
                </MyButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col style={{ height: "100%" }} span={16}>
          {/* <div style={{ height: "15rem", marginTop: "20px" }}> */}
          <MyDataTable
            style={{ height: "80vh" }}
            columns={columns}
            data={rows}
          />
          {/* </div> */}
        </Col>
      </Row>
    </div>
  );
}

export default QaProcess;

const rules = {
  processName: [
    {
      required: true,
      message: "Process Name is required",
    },
  ],
  processDesc: [
    {
      required: true,
      message: "Process description is required",
    },
  ],
};

import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
import { Card, Col, Form, Input, Row, Space } from "antd";
//@ts-ignore
import MyDataTable from "../../Components/MyDataTable";
//@ts-ignore
// import { v4 } from "uuid";
// import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
//@ts-ignore
import useApi from "../../hooks/useApi.ts";
import { createUOM, getUOMList } from "../../api/master/uom";
//@ts-ignore
import { ResponseType } from "../../types/general.ts";

const Uom = () => {
  const [uomData, setUomData] = useState([]);

  // old code
  // const [loading, setLoading] = useState(false);
  // const [newUom, setNewUom] = useState({
  //   uom: "",
  //   description: "",
  // });

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  //   fetch uom
  const handleFetchUOMList = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomData(response.data ?? []);

    // old code
    // setLoading(true);
    // const response = await imsAxios.get("/uom");
    // let arr = response.data.map((row, index) => {
    //   return {
    //     ...row,
    //     index: index + 1,
    //     id: v4(),
    //   };
    // });
    // setUomData(arr);
    // setLoading(false);
  };

  //   add UOM
  const submitHandler = async () => {
    const values = await form.validateFields();
    const response: ResponseType = await executeFun(
      () => createUOM(values),
      "submit"
    );
    if (response.success) {
      form.resetFields();
      handleFetchUOMList();
    }

    // old code
    // e.preventDefault();
    // if (!newUom.uom) {
    //   toast.error("Please Add UoM");
    // } else if (!newUom.description) {
    //   toast.error("Please Add Description");
    // } else {
    //   setLoading(true);
    //   const response = await imsAxios.post("/uom/insert", {
    //     uom: newUom.uom,
    //     description: newUom.description,
    //   });
    //   if (response.success) {
    //     setNewUom({
    //       uom: "",
    //       description: "",
    //     });
    //     fetchUOm();
    //     setLoading(false);
    //   } else {
    //     toast.error(response.message?.msg || response.message);
    //     setLoading(false);
    //   }
    // }
  };

  const resetHandler = () => {
    form.resetFields();

    //old code
    // setNewUom({
    //   uom: "",
    //   description: "",
    // });
  };

  const columns = [
    { field: "id", headerName: "#", width: 30 },
    { field: "name", headerName: "Unit", minWidth: 170, flex: 1 },
    { field: "details", headerName: "Specification", minWidth: 170, flex: 1 },
  ];
  // old code
  // const columns = [
  //   { field: "index", headerName: "S.No", width: 170 },
  //   { field: "units_name", headerName: "Unit", width: 170 },
  //   { field: "units_details", headerName: "Specification", width: 170 },
  // ];

  useEffect(() => {
    handleFetchUOMList();
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <Row gutter={6} style={{ padding: 10 }} >
        <Col span={8}>
          <Card size="small" title="Create UOM">
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Unit">
                <Input />
              </Form.Item>
              <Form.Item name="details" label="Specification">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Row justify="center">
                <Space>
                  <MyButton onClick={resetHandler} variant="reset" />
                  <MyButton
                    loading={loading("submit")}
                    onClick={submitHandler}
                    variant="submit"
                  />
                </Space>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <div className="m-2" style={{ height: "100%" }}>
            <div style={{ height: "80vh" }}>
              <MyDataTable
                loading={loading("fetch")}
                data={uomData}
                columns={columns}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Uom;

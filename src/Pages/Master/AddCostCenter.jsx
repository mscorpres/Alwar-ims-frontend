import { useCallback, useEffect, useState } from "react";
import { Button, Card, Form, Input, Row } from "antd";
import PropTypes from "prop-types";
import { imsAxios } from "../../axiosInterceptor";
import MyDataTable from "../../Components/MyDataTable";
import { useToast } from "../../hooks/useToast";

export default function AddCostCenter({
  setShowAddCostModal,
}) {
  const { showToast } = useToast();
  const [centerData, setCenterData] = useState([]);
  const [newCostCenter, setNewCostCenter] = useState({
    code: "",
    name: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const inputHandler = (name, value) => {
    let obj = newCostCenter;
    obj = { ...obj, [name]: value };
    setNewCostCenter(obj);
  };
  const submitCostCenter = async () => {
    if (newCostCenter.name.length > 0 && newCostCenter.code.length > 0) {
      try {
        setSubmitLoading(true);
        const response = await imsAxios.post("/purchaseOrder/createCostCenter", {
          code: newCostCenter.code,
          name: newCostCenter.name,
        });

        const isSuccess =
          Boolean(response?.success) ||
          Number(response?.code) === 200 ||
          String(response?.status).toLowerCase() === "success";

        if (isSuccess) {
          showToast(response?.message || "Cost center created successfully", "success");
          setNewCostCenter({
            code: "",
            name: "",
          });
          if (typeof setShowAddCostModal === "function") {
            setShowAddCostModal(false);
          }
          handleFetchUOMList();
        } else {
          showToast(response?.message || "Failed to create cost center", "error");
        }
      } catch (error) {
        showToast(error?.message || "Failed to create cost center", "error");
      } finally {
        setSubmitLoading(false);
      }
    } else {
      showToast("Cost Center should have a Name and ID", "error");
    }
  };

  const handleFetchUOMList = useCallback(async () => {
    try {
      const response = await imsAxios.get("backend/costCenter");

      if (response?.success) {
        const formattedRows = (response?.data ?? []).map((item, index) => ({
          ...item,
          id: item?.uID || `${item?.name || ""}-${item?.code || ""}-${index}`,
        }));
        setCenterData(formattedRows);
      } else {
        showToast(response?.message || "Failed to fetch cost centers", "error");
      }
    } catch (error) {
      showToast(error?.message || "Failed to fetch cost centers", "error");
    }
  }, [showToast]);

  const columns = [
    { field: "code", headerName: "Cost Center ID", minWidth: 170, flex: 1 },
    { field: "name", headerName: "Cost Center Name", minWidth: 220, flex: 1 },
    { field: "timestamp", headerName: "Date", minWidth: 170, flex: 1 },
  ];

  useEffect(() => {
    handleFetchUOMList();
  }, [handleFetchUOMList]);

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "1fr 2fr",
        padding: "20px",
      }}
    >
      <div>
        <Card title="Add Cost Center" style={{ width: "100%" }}>
          <Form layout="vertical" style={{ height: "95%" }}>
            <Form.Item label="Cost Center Id">
              <Input
                inputMode="numeric"
                value={newCostCenter.code}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replaceAll(/\D/g, "");
                  inputHandler("code", digitsOnly);
                }}
                placeholder="Enter Cost Center ID"
              />
            </Form.Item>
            <Form.Item label="Cost Center Name">
              <Input
                value={newCostCenter.name}
                onChange={(e) => {
                  inputHandler("name", e.target.value);
                }}
                placeholder="Enter Cost Center Name"
              />
            </Form.Item>
          </Form>
          <Row justify="end">
            <Button
              onClick={submitCostCenter}
              loading={submitLoading}
              type="primary"
            >
              Submit
            </Button>
          </Row>
        </Card>
      </div>
      <div className="m-2" style={{ height: "100%" }}>
        <div style={{ height: "80vh" }}>
          <MyDataTable
            // loading={loading("fetch")}
            data={centerData}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}

AddCostCenter.propTypes = {
  setShowAddCostModal: PropTypes.func,
};

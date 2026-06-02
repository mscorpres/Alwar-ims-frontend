import React, { useEffect, useState } from "react";
import { Select,Modal, Row, Col  } from "antd";
import { useToast } from "../../../hooks/useToast.js";
import MyDatePicker from "../../../Components/MyDatePicker";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";

const OpenR1Modal = ({
  viewModal,
  setViewModal,
  setAllResponseData,
  setLoading,
}) => {
  const { showToast } = useToast();
  const [seacrh, setSearch] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [date, setDate] = useState("");
  const [dataa, setData] = useState({
    selectProduct: undefined,
    bom: undefined,
  });

  const { executeFun, loading1 } = useApi();

  const [bomName, setBomName] = useState([]);
  const opt = [{ label: "Bom Wise", value: "Bom Wise" }];

  const getProductNameFecth = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      setAsyncOptions(response.data);
    }
  };

  const getBom = async () => {
    const productKey =
      dataa?.selectProduct?.value ?? dataa?.selectProduct ?? "";
    if (!productKey) return;

    const response = await imsAxios.post("/backend/fetchBomForProduct", {
      search: productKey,
    });
    const arr = response.data.map((d) => {
      return { value: d.bomid, label: d.bomname };
    });
    setBomName(arr);
  };

  useEffect(() => {
    if (dataa.selectProduct) {
      getBom();
    }
  }, [dataa.selectProduct]);

  useEffect(() => {
    if (!viewModal) return;
    if (dataa.selectProduct?.value && dataa.selectProduct?.label) {
      setAsyncOptions([dataa.selectProduct]);
    }
    if (dataa.selectProduct) {
      getBom();
    }
  }, [viewModal]);

  const generateFun = async () => {
    setLoading(true);
    setAllResponseData([]);
    const response = await imsAxios.post("/report1", {
      product: dataa.selectProduct?.value ?? dataa.selectProduct,
      subject: dataa.bom?.value ?? dataa.bom,
      date: date,
      action: "search_r1",
    });
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllResponseData(arr);
      setLoading(false);
    } else if (!response.success) {
      showToast(response.message, "error");
      setLoading(false);
    }
  };

  if (!viewModal) {
    return null;
  }

  return (
    <form>
      <Modal
        title="BOM Wise Report"
        centered
        open={viewModal}
        onOk={() => {
          generateFun();
          setViewModal(false);
        }}
        onCancel={() => setViewModal(false)}
        width={800}
      >
        <Row  gutter={16}>
          <Col span={12}>
            <MyAsyncSelect
              selectLoading={selectLoading}
              style={{ width: "100%" }}
              loadOptions={getProductNameFecth}
              onBlur={() => setAsyncOptions([])}
              onInputChange={(e) => setSearch(e)}
              labelInValue
              value={dataa.selectProduct}
              placeholder="Product Name / SKU"
              optionsState={asyncOptions}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  selectProduct: e,
                  bom: "",
                }))
              }
            />
          </Col>
          <Col span={12}>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Bom"
              options={bomName}
              labelInValue
              value={dataa.bom || undefined}
              onChange={(bom) =>
                setData((prev) => ({
                  ...prev,
                  bom,
                }))
              }
            />
          </Col>
          <Col span={12} style={{ marginTop: "5px" }}>
            <Select
              options={opt}
              placeholder="Bom Wise"
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={12} style={{ marginTop: "5px" }}>
            <MyDatePicker
              setDateRange={setDate}
              value={date}
              size="default"
            />
          </Col>
        </Row>
      </Modal>
    </form>
  );
};

export default OpenR1Modal;

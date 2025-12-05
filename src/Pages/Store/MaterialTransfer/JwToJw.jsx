import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
const { TextArea } = Input;

function JwToJw() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    jwVendor: "",
    jwPo: "",
    locationFrom: "202102201753",
    remark: "",
  });

  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty1: "",
      locationTo: "",
      stockQty: "",
      unit: "",
    },
  ]);

  const [jwVendorOptions, setJwVendorOptions] = useState([]);
  const [jwPoOptions, setJwPoOptions] = useState([]);
  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [vendorAsyncOptions, setVendorAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const { executeFun, loading: loading1 } = useApi();

  // Check if any row has qty exceeding stock
  const hasQtyExceeded = rows.some(
    (row) =>
      row.qty1 &&
      row.stockQty &&
      Number(row.qty1) > Number(row.stockQty)
  );

  // Add row functionality
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
      },
    ]);
  };

  // Remove row functionality
  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    } else {
      toast.error("At least one row is required");
    }
  };

  const getJwVendorOptions = async (search) => {
    if (search?.length > 2) {
      try {
        const response = await imsAxios.post("/backend/vendorList", {
          search: search,
        });
        let v = [];
        if (response?.data && Array.isArray(response.data)) {
          response.data.map((ad) => v.push({ text: ad.text, value: ad.id }));
        }
        setVendorAsyncOptions(v);
      } catch (error) {
        console.error("Error fetching JW Vendor list:", error);
      }
    }
  };

  const getJwPoOptions = async (vendorId) => {
    try {
      const response = await imsAxios.get(`/godown/transfer/jw-jw/po/${vendorId}`);
      let v = [];
      if (response?.data && Array.isArray(response.data)) {
        response.data.map((ad) =>
          v.push({
            label: (
              <div>
                <div>{ad.jobworkID}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {ad.createdDate}
                </div>
              </div>
            ),
            value: ad.jobworkID,
            title: ad.jobworkID,
            searchText: `${ad.jobworkID} ${ad.createdDate}`,
          })
        );
      }
      setJwPoOptions(v);
    } catch (error) {
      console.error("Error fetching JW PO list:", error);
    }
  };

  const getLocationFunction = async () => {
    // Default pick location for JW to JW
    setloctionData([{ label: "JW001", value: "202102201753" }]);
  };

  const getLocationFunctionTo = async () => {
    const response = await imsAxios.post("/godown/fetchLocationForJW2JW_to");
    let v = [];
    if (response?.data && Array.isArray(response.data)) {
      response.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    }
    setloctionDataTo(v);
  };

  const getComponentList = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data?.map((d) => {
        return { text: d.text, value: d.id, unit: d.units || d.unit || d.uom || "" };
      });
      setAsyncOptions(arr);
    }
  };

  const getQtyFuction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!component || !allData.jwPo || !allData.jwVendor) return;

    const response = await imsAxios.get(
      `/godown/transfer/jw-jw/stock/${component}?jw=${allData.jwPo}&vendor=${allData.jwVendor}`
    );

    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        stockQty: response?.data?.jwPendingStock || "0",
      };
      return updated;
    });
  };

  const saveJwToJw = async () => {
    // Validations
    if (!allData.jwVendor) {
      return toast.error("Please select JW Vendor");
    }

    if (!allData.jwPo) {
      return toast.error("Please select JW PO");
    }

    if (!allData.locationFrom) {
      return toast.error("Please select Pick Location");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.component) {
        return toast.error(`Row ${i + 1}: Please select Component`);
      }
      if (!row.qty1) {
        return toast.error(`Row ${i + 1}: Please enter Qty`);
      }
      if (!row.locationTo) {
        return toast.error(`Row ${i + 1}: Please select Drop Location`);
      }
      if (row.locationTo == allData.locationFrom) {
        return toast.error(`Row ${i + 1}: Both Location Same`);
      }
    }

    setLoading(true);

    // Prepare arrays for payload
    const components = rows.map((row) => row.component);
    const tolocations = rows.map((row) => row.locationTo);
    const qtys = rows.map((row) => row.qty1);

    const response = await imsAxios.post("/godown/transferJW2JW", {
      jw_vendor: allData.jwVendor,
      jw_po: allData.jwPo,
      fromlocation: allData.locationFrom,
      component: components,
      tolocation: tolocations,
      qty: qtys,
      remark: allData.remark,
      type: "JW2JW",
    });

    if (response.success) {
      toast.success(response.message.toString()?.replaceAll("<br/>", ""));
      // Reset form
      setAllData({
        jwVendor: "",
        jwPo: "",
        locationFrom: "202102201753",
        remark: "",
      });
      setJwPoOptions([]);
      setRows([
        {
          id: v4(),
          component: "",
          qty1: "",
          locationTo: "",
          stockQty: "",
          unit: "",
        },
      ]);
      setLoading(false);
    } else {
      toast.error(response?.message);
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setAllData({
      jwVendor: "",
      jwPo: "",
      locationFrom: "202102201753",
      remark: "",
    });
    setJwPoOptions([]);
    setRows([
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
      },
    ]);
  };

  useEffect(() => {
    getLocationFunction();
    getLocationFunctionTo();
  }, []);

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ padding: "10px", height: "79vh" }}>
        <Col span={6}>
          <Row gutter={10} style={{ margin: "5px" }}>
            <Col span={24} style={{ marginBottom: "10px", width: "100%" }}>
              <span>SELECT JW VENDOR</span>
            </Col>
            <Col span={24}>
              <MyAsyncSelect
                placeholder="Type to search vendor..."
                style={{ width: "100%" }}
                optionsState={vendorAsyncOptions}
                loadOptions={getJwVendorOptions}
                onBlur={() => setVendorAsyncOptions([])}
                value={allData.jwVendor || undefined}
                onChange={(e) => {
                  setAllData((allData) => {
                    return { ...allData, jwVendor: e, jwPo: "" };
                  });
                  getJwPoOptions(e);
                }}
              />
            </Col>
            <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
              <span>SELECT JW PO</span>
            </Col>
            <Col span={24}>
              <Select
                placeholder="Please Select JW PO"
                style={{ width: "100%" }}
                options={jwPoOptions}
                showSearch
                optionLabelProp="title"
                filterOption={(input, option) =>
                  (option?.searchText ?? option?.value ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                value={allData.jwPo || undefined}
                disabled={!allData.jwVendor}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, jwPo: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
              <span>SELECT PICK LOCATION</span>
            </Col>
            <Col span={24}>
              <Select
                placeholder="Please Select Location"
                style={{ width: "100%" }}
                options={locData}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                value={allData.locationFrom || undefined}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, locationFrom: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
              <span>REMARK</span>
            </Col>
            <Col span={24}>
              <TextArea
                rows={4}
                placeholder="Enter remark..."
                value={allData.remark}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, remark: e.target.value };
                  })
                }
              />
            </Col>
          </Row>
        </Col>

        <Col span={18}>
          <Row gutter={10}>
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 10,
                }}
              >
                <Button type="primary" onClick={addRow}>
                  Add Row
                </Button>
              </div>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "38vh",
                }}
              >
                <table
                  style={{
                    tableLayout: "fixed",
                    width: "100%",
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      <th className="an" style={{ width: "25vw" }}>
                        Component/Part No.
                      </th>
                      <th className="an" style={{ width: "15vw" }}>
                        STOCK QUANTITY
                      </th>
                      <th className="an" style={{ width: "15vw" }}>
                        TRANSFERING QTY
                      </th>
                      <th className="an" style={{ width: "20vw" }}>
                        DROP LOCATION
                      </th>
                      <th className="an" style={{ width: "5vw" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ width: "25vw" }}>
                          <MyAsyncSelect
                            style={{ width: "100%" }}
                            loadOptions={getComponentList}
                            onBlur={() => setAsyncOptions([])}
                            onInputChange={(e) => setSearch(e)}
                            placeholder="Part Name/Code"
                            value={row.component}
                            optionsState={asyncOptions}
                            onChange={(e) => {
                              // Find selected option to get unit
                              const selectedOption = asyncOptions.find(
                                (opt) => opt.value === e
                              );
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  component: e,
                                  unit: selectedOption?.unit || "",
                                };
                                return updated;
                              });
                              getQtyFuction(index, e);
                            }}
                          />
                        </td>
                        <td style={{ width: "15vw" }}>
                          <Input
                            disabled
                            value={row.stockQty || "0"}
                            suffix={row.unit || ""}
                          />
                        </td>
                        <td style={{ width: "15vw" }}>
                          <Input
                            value={row.qty1}
                            onChange={(e) => {
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  qty1: e.target.value,
                                };
                                return updated;
                              });
                            }}
                            suffix={row.unit || ""}
                            style={{
                              backgroundColor:
                                row.qty1 &&
                                row.stockQty &&
                                Number(row.qty1) > Number(row.stockQty)
                                  ? "#ffcccc"
                                  : undefined,
                            }}
                          />
                        </td>
                        <td style={{ width: "20vw" }}>
                          <Select
                            style={{ width: "100%" }}
                            options={locDataTo}
                            value={row.locationTo || undefined}
                            placeholder="Select Location"
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={(e) => {
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  locationTo: e,
                                };
                                return updated;
                              });
                            }}
                          />
                        </td>
                        <td style={{ width: "5vw", textAlign: "center" }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeRow(row.id)}
                            disabled={rows.length === 1}
                            title="Delete Row"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <NavFooter
        nextLabel="Transfer"
        submitFunction={saveJwToJw}
        resetFunction={reset}
        loading={loading}
        nextDisabled={hasQtyExceeded}
      />
    </div>
  );
}

export default JwToJw;

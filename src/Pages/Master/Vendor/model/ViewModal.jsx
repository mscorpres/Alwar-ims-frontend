import React, { useEffect, useState } from "react";
import "../../Modal/modal.css";
import { toast } from "react-toastify";
import { Button, Row, Col, Input, Skeleton, Form, Drawer, Space } from "antd";
import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import Loading from "../../../../Components/Loading";
import { imsAxios } from "../../../../axiosInterceptor";
const { TextArea } = Input;

const ViewModal = ({ viewVendor, setViewVendor }) => {
  const [allField, setAllField] = useState({
    branchCode: "",
    label: "",
    state: "",
    city: "",
    gst: "",
    pcode: "",
    email: "",
    mob: "",
    address: "",
    fax: "",
    addresscode: "",
  });
  const [resetData, setResetData] = useState({});
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [submitLoading, setsubmitLoading] = useState(false);
  const [allBranchData, setAllBranchData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const fetchAllBranchList = async () => {
    setSkeletonLoading(true);
    const response = await imsAxios.post("/vendor/getAllBranchList", {
      vendor_id: viewVendor.vendor_code,
    });
    if (response.success) {
      let a = [];
      response.data.map((d) => a.push({ text: d.text, value: d.id }));
      getBranchDetails(a[0].value, "skeletonLoading");
      setAllBranchData(a);
      setSkeletonLoading(false);
    }
    setSkeletonLoading(false);
  };
  const getBranchDetails = async (branchId, loadingType) => {
    if (loadingType != "skeletonLoading") {
      setSpinLoading(true);
    }
    const response = await imsAxios.post("/vendor/getBranchDetails", {
      addresscode: branchId,
    });
    setSpinLoading(false);
    if (response.success) {
      setAllField((allField) => {
        return {
          ...allField,
          branchCode: response.data[0].address_code,
          label: response.data[0].label,
          email: response.data[0].email_id,
          city: response.data[0].city,
          gst: response.data[0].gstin,
          pcode: response.data[0].pincode,
          mob: response.data[0].mobile_no,
          fax: response.data[0].fax,
          address: response.data[0].address,
          state: {
            value: response.data[0].statecode,
            label: response.data[0].statename,
          },
        };
      });
      setResetData((allField) => {
        return {
          ...allField,
          branchCode: response.data[0].address_code,
          label: response.data[0].label,
          email: response.data[0].email_id,
          city: response.data[0].city,
          gst: response.data[0].gstin,
          pcode: response.data[0].pincode,
          mob: response.data[0].mobile_no,
          fax: response.data[0].fax,
          address: response.data[0].address,
          state: {
            value: response.data[0].statecode,
            label: response.data[0].statename,
          },
        };
      });
    }
  };
  const getOption = async (a) => {
    if (a?.length > 1) {
      const response = await imsAxios.post("/backend/stateList", {
        search: a,
      });

      if (response.success && response.data) {
        let arr = response.data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      }
    }
  };

  const updateBranch = async () => {
    if (allField.label == "") {
      return toast.error("Please enter branch name");
    } else if (allField.city == "") {
      return toast.error("Please enter City name");
    } else if (allField.address == "") {
      return toast.error("Please enter Complete branch address");
    } else if (allField.pcode == "") {
      return toast.error("Please enter branch Pincode");
    } else if (allField.gst == "") {
      return toast.error("Please enter branch GST Number");
    }
    setsubmitLoading(true);
    const response = await imsAxios.post("/vendor/updateBranchDetails", {
      label: allField.label,
      state: allField.state.value,
      city: allField.city,
      address: allField.address,
      pincode: allField.pcode,
      fax: allField.fax == "" && "--",
      email: allField.email == "" && "--",
      mobile: allField.mob == "" && "--",
      gstid: allField.gst,
      address_code: allField.branchCode,
      vendor_code: viewVendor.vendor_code,
    });
    setsubmitLoading(false);
    if (response.success) {
      setViewVendor(null);
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const reset = () => {
    setAllField(resetData);
  };

  useEffect(() => {
    if (viewVendor == false) {
      reset();
    } else if (viewVendor) {
      fetchAllBranchList();
    }
  }, [viewVendor]);

  return (
    <form>
      <Drawer
        title={`Edit Branch of Vendor: ${viewVendor?.vendor_code}`}
        centered
        confirmLoading={submitLoading}
        open={viewVendor}
        onClose={() => setViewVendor(false)}
        width="50vw"
      >
        <Skeleton loading={skeletonLoading} active />
        <Skeleton loading={skeletonLoading} active />
        {spinLoading && <Loading />}
        {!skeletonLoading && (
          <Form style={{ marginTop: -10 }} layout="vertical" size="small">
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <Form.Item label="Select Branch">
                  <MySelect
                    value={allField.branchCode}
                    options={allBranchData}
                    onChange={(e) => {
                      getBranchDetails(e);
                      setAllField((allField) => {
                        return { ...allField, addresscode: e };
                      });
                    }}
                  />
                </Form.Item>
              </Col>

              <>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Branch Name">
                    <Input
                      size="default "
                      value={allField.label}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, label: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="State">
                    <MyAsyncSelect
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={allField?.state}
                      labelInValue
                      loadOptions={getOption}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, state: e };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="City">
                    <Input
                      size="default "
                      value={allField.city}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, city: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="GST Number">
                    <Input
                      size="default "
                      value={allField.gst}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, gst: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Pin Code">
                    <Input
                      size="default "
                      value={allField.pcode}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, pcode: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Email">
                    <Input
                      size="default "
                      value={allField.email}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, email: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Mobile">
                    <Input
                      size="default "
                      value={allField.mob}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, mob: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Fax Number">
                    <Input
                      size="default "
                      value={allField.fax}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, fax: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={24} style={{ padding: "3px" }}>
                  <Form.Item label="Branch Address">
                    <TextArea
                      rows={4}
                      maxLength={200}
                      value={allField.address}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, address: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              </>
            </Row>
            <Row justify="end">
              <Space>
                <Button onClick={reset} size="default">
                  Reset
                </Button>
                <Button
                  size="default"
                  type="primary"
                  loading={submitLoading}
                  onClick={updateBranch}
                >
                  Submit
                </Button>
              </Space>
            </Row>
          </Form>
        )}
      </Drawer>
    </form>
  );
};

export default ViewModal;

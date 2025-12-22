import React, { useState } from "react";
import { Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker.jsx";
import { useToast } from "../../../hooks/useToast.js";
import MyDataTable from "../../../Components/MyDataTable.jsx";
import { downloadCSV } from "../../../Components/exportToCSV.jsx";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
import { imsAxios } from "../../../axiosInterceptor.js";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MyButton from "../../../Components/MyButton/index.jsx";
import EditPO from "../ManagePO/EditPO/EditPO.jsx";
import ViewPORequest from "./ViewPORequest.jsx";

const RequestPo = () => {
  const { showToast } = useToast();
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewPoId, setViewPoId] = useState(null);
  const [rows, setRows] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [updatePoId, setUpdatePoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // VIEW Icon
        <GridActionsCellItem
          key="view"
          showInMenu
          label="View"
          onClick={() => getComponentData(row.po_transaction, row.po_status)}
        />,
        <GridActionsCellItem
          key="edit"
          showInMenu
          label="Edit"
          onClick={() => getPoDetail(row.po_transaction)}
          disabled={row.poacceptstatus === "UNDER VERIFICATION"}
        />,
      ],
    },
    {
      headerName: "#.",
      field: "index",
      width: 30,
    },
    {
      headerName: "PO ID",
      field: "po_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_transaction} copy={true} />
      ),
      minWidth: 170,
    },
    {
      headerName: "PO ACCEPTANCE",
      field: "poacceptstatus",
      renderCell: ({ row }) => {
        const status = row.poacceptstatus?.toUpperCase() || "";
        let color = "#000000"; // default black

        if (status === "APPROVED") {
          color = "#52c41a"; // green
        } else if (status === "REJECTED") {
          color = "#ff4d4f"; // red
        } else if (status === "PENDING") {
          color = "#faad14"; // yellow
        } else if (status === "UNDER VERIFICATION") {
          color = "#8c8c8c"; // gray
        }

        // Adjust text color for better contrast on yellow background
        const textColor = status === "PENDING" ? "#000000" : "#ffffff";

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: color,
              color: textColor,
              padding: "3px 14px",
              borderRadius: "16px",
              fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.75rem",
              fontWeight: "600",
              letterSpacing: "0.3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              border:
                status === "PENDING"
                  ? "1px solid rgba(0, 0, 0, 0.1)"
                  : "1px solid rgba(255, 255, 255, 0.2)",
              lineHeight: "1.4",
              minHeight: "22px",
            }}
            title={row.poacceptstatus}
          >
            {row.poacceptstatus}
          </div>
        );
      },
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      flex: 1,
      minWidth: 150,
    },

    {
      headerName: "Vendor Name",
      field: "vendor_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor_name} />,
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Vendor Code",
      field: "vendor_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendor_id} copy={true} />
      ),
      width: 100,
    },
    {
      headerName: "Project ID",
      field: "project_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.project_id} copy={true} />
      ),
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Project Name",
      field: "project_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project_name} />,
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Requested By",
      field: "requested_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.requested_by} />,
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Approved By/Rejected By",
      field: "approved_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.approved_by} />,
      minWidth: 200,
      flex: 1,
    },

    {
      headerName: "Po Reg. Date",
      field: "po_reg_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_date} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Created By",
      field: "po_reg_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_by} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Approval Status",
      field: "approval_status",
      renderCell: ({ row }) => <ToolTipEllipses text={row.approval_status} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Advance Payment",
      field: "advPayment",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.advPayment == "0" ? "NO" : "YES"} />
      ),
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Comment",
      field: "po_comment",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_comment} />,
      flex: 1,
      minWidth: 150,
    },
  ];
  //getting rows from database from date wise filter
  const getSearchResults = async (silent = false) => {
    // If no date range is set, silently skip refresh (e.g., after approve/reject)
    if (!searchDateRange) {
      if (!silent) {
        showToast("Please select start and end dates for the results", "error");
      }
      return;
    }

    setRows([]);
    setSearchLoading(true);
    try {
      const response = await imsAxios.post("/purchaseOrder/requested", {
        data: searchDateRange,
        wise: "single_date_wise",
      });
      setSearchLoading(false);
      if (response.success) {
        let arr = response.data?.map((row, index) => ({
          ...row,
          id: row.po_transaction,
          index: index + 1,
        }));
        setRows(arr);
        // If no results and not silent, show info message
        if (arr.length === 0 && !silent) {
          // Note: PO might have been approved/rejected and is no longer in requested list
        }
      } else if (response.message) {
        if (!silent) {
          showToast(response.message, "error");
        }
      } else {
        if (!silent) {
          showToast(response.message, "error");
        }
      }
    } catch (error) {
      setSearchLoading(false);
      if (!silent) {
        showToast("Error fetching PO list", "error");
      }
    }
  };

  //getting component view data - now opens ViewPORequest modal
  const getComponentData = async (poid, status) => {
    setViewPoId(poid);
  };

  const getPoDetail = async (poid) => {
    setLoading(true);
    const response = await imsAxios
      .post("/purchaseOrder/fetchData4Update", {
        pono: poid.replaceAll("_", "/"),
      })
    setLoading(false);
    if (response.success) {
      setUpdatePoId({
        ...response.data.bill,
        materials: response.data.materials,
        ...response.data.ship,
        ...response.data.vendor[0],
      });
    } else {
      showToast(response.message, "error");
    }
  };

  return (
    <div className="manage-po" style={{ position: "relative", height: "100%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
            </div>
            <MyButton
              disabled={searchDateRange === ""}
              type="primary"
              loading={searchLoading}
              onClick={getSearchResults}
              id="submit"
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>

      <div
        style={{
          height: "calc(100vh - 160px)",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 10px",
        }}
      >
        <MyDataTable
          loading={loading || searchLoading}
          rows={rows}
          columns={columns}
        />
      </div>
      <ViewPORequest
        poId={viewPoId}
        setPoId={setViewPoId}
        getRows={getSearchResults}
      />
      {updatePoId && (
        <EditPO updatePoId={updatePoId} setUpdatePoId={setUpdatePoId} getRows={getSearchResults}/>
      )}
    </div>
  );
};

export default RequestPo;
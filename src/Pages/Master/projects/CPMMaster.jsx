import { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Switch, Modal } from "antd";
import ViewBomOfProject from "./ViewBomOfProject";
import { imsAxios } from "../../../axiosInterceptor";

import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import NewProjectForm from "./NewProjectForm";
import { useToast } from "../../../hooks/useToast.js";
import { downloadCSVnested2 } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import UpdateProjectModal from "./UpdateProjectModal";

function CPMMaster() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editProject, setEditProject] = useState(false);
  const [viewProject, setViewProject] = useState(false);

  const getAllDetailFun = async () => {
    setLoading("table");
    const response = await imsAxios.post("/ppr/allProjects");
    setLoading(false);

    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
      setRows([]);
    }
  };

  const handleSubmit = async (updatedData) => {
    try {
      const response = await imsAxios.put("/ppr/update/project", updatedData);
      if (response.success) {
        showToast("Project updated successfully!", "success");
        setIsModalVisible(false);
        getAllDetailFun(); // Refresh the data after successful update
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update the project. Please try again.",
        "error",
      );
    }
  };

  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "All Projects");
  };

  const disableValidateHandler = async (row, status) => {
    const payload = {
      project: row.project,
      status: status ? "1" : "0",
    };

    Modal.confirm({
      title: "Changing Project Status",
      content: `Are you sure you want to change the status of ${row.name}?`,
      okText: "Continue",
      onOk: () => disableSubmitHandler(payload),
      cancelText: "Back",
    });
  };

  const disableSubmitHandler = async (values) => {
    const response = await imsAxios.put(
      `/backend/project/status/${values.project}`,
      values,
    );
    if (response.success) {
      if (response.success) {
        getAllDetailFun();
        // getDataTree();
        showToast(response.message, "success");
      } else {
        showToast(response.message, "error");
      }
    }
  };

  const getBomList = (row) => {
    const raw = row?.bomSubject ?? row?.bom;
    if (Array.isArray(raw)) return raw;
    return raw ? [raw] : [];
  };

  const getBomName = (item) =>
    item?.display_text ?? item?.subject_name ?? item?.name ?? item?.text ?? "";

  const getRecipeType = (item) => {
    const label = String(item?.bom_type_label ?? "")
      .trim()
      .toLowerCase();
    if (label === "sfg") return "semi";
    if (label === "fg") return "default";
    return String(
      item?.bom_recipe_type ??
        item?.recipe_type ??
        item?.type ??
        item?.bom_recipe ??
        "",
    )
      .trim()
      .toLowerCase();
  };
  const isFgType = (type) => ["default", "fg", "finished"].includes(type);
  const isSfgType = (type) =>
    ["semi", "sfg", "semi-fg", "semifg"].includes(type);
  const getFgSfgBom = (row) => {
    const list = getBomList(row);
    const fgByType = list.find((item) => isFgType(getRecipeType(item)));
    const sfgByType = list.find((item) => isSfgType(getRecipeType(item)));
    if (fgByType || sfgByType) {
      return { fg: fgByType ?? null, sfg: sfgByType ?? null };
    }
    // Backend often sends [SFG, FG] when type is missing.
    if (list.length >= 2) {
      return { fg: list[1], sfg: list[0] };
    }
    return { fg: list[0] ?? null, sfg: null };
  };

  const columns = [
    { field: "index", headerName: "Sr. No", minWidth: 80 },
    { field: "project", headerName: "Project Id", minWidth: 180 },
    { field: "description", headerName: "Project Name", minWidth: 180},
    { field: "qty", headerName: "Quantity", minWidth: 110 },
    { field: "costcenter", headerName: "Cost Center", minWidth: 110, renderCell: ({row}) =>   row.costcenter?.cost_center_name ? row.costcenter?.cost_center_name : "" },
    { field: "bomSubject", headerName: "BOM", minWidth: 140,  renderCell: ({row}) =>   row.bomSubject?.subject_name ? row.bomSubject?.subject_name : ""  },
    {
      field: "fgBomName",
      headerName: "FG BOM",
      minWidth: 200,
      flex: 1,
      valueGetter: (_value, row) => {
        const { fg } = getFgSfgBom(_value?.row ?? row);
        return getBomName(fg) || "";
      },
    },
    {
      field: "sfgBomName",
      headerName: "SFG BOM",
      minWidth: 200,
      flex: 1,
      valueGetter: (_value, row) => {
        const { sfg } = getFgSfgBom(_value?.row ?? row);
        return getBomName(sfg) || "";
      },
    },
    { field: "insert_dt", headerName: "Insert Date", minWidth: 180 },
    {
      headerName: "Status",
      field: "projectStatus",
      minWidth: 100,
      renderCell: ({ row }) => <>{row.status === 1 ? "Active" : "InActive"}</>,
    },
    {
      headerName: "Modify Status",
      minWidth: 180,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === 1}
          onChange={(e) => {
            console.log(e);
            disableValidateHandler(row, e);
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      type: "actions",
      getActions: ({ row }) => [
        // Edit icon
        <TableActions
          action="edit"
          onClick={() => {
            setIsModalVisible(true);
            setEditProject(row);
          }}
        />,
        <TableActions
          action="view"
          onClick={() => {
            setIsViewModalVisible(true);
            setViewProject(row);
          }}
        />,
      ],
    },
  ];

  useEffect(() => {
    getAllDetailFun();
  }, []);

  return (
    <Row gutter={10} style={{ height: "100%", padding: 10 }}>
      <Col span={4}>
        <Card
          size="small"
          style={{ marginTop: "8%" }}
          title={"Add New Project"}
        >
          <Typography.Title
            style={{ marginBottom: 30, marginTop: 10 }}
            level={4}
          ></Typography.Title>
          {/* {editProject ? (
            <EditProjectForm
              editProject={editProject}
              setEditProject={setEditProject}
              getAllDetailFun={getAllDetailFun}
            />
          ) : ( */}
          <NewProjectForm />
          {/* )} */}
        </Card>
      </Col>
      <Col style={{ height: "95%" }} span={20}>
        <Row justify="end" style={{ margin: "5x 0" }}>
          <CommonIcons
            disabled={rows.length === 0}
            onClick={handleDownload}
            action="downloadButton"
          />
        </Row>
        <MyDataTable
          data={rows}
          columns={columns}
          loading={loading === "table"}
        />
      </Col>
      {/* <NavFooter
        submithtmlType="submit"
        submitButton={true}
        formName="edit-project"
        nextLabel="Submit"
        resetFunction={resetFunction}
      /> */}
      <UpdateProjectModal
        data={editProject}
        setIsModalVisible={setIsModalVisible}
        isModalVisible={isModalVisible}
        onUpdate={handleSubmit}
      />
      <ViewBomOfProject
        show={isViewModalVisible}
        hide={() => setIsViewModalVisible(false)}
        selectedBOM={viewProject}
      />
    </Row>
  );
}

export default CPMMaster;

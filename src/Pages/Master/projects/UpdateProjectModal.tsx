import { useState, useEffect } from "react";
import { Drawer, Input, Button, Form, message } from "antd";
//@ts-ignore
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { getCostCentresOptions, getBomOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "@/utils/general";
import useApi from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";

const UpdateProjectModal = ({
  data,
  setIsModalVisible,
  isModalVisible,
  onUpdate,
  isUpdateLoading,
}: any) => {
  const [form] = Form.useForm();
  const { showToast } = useToast();
  const [fgBomOptions, setFgBomOptions] = useState([]);
  const [sfgBomOptions, setSfgBomOptions] = useState([]);
  const [costCenterOptions, setCostCenterOptions] = useState([]);


  const { executeFun } = useApi();
  const getRecipeType = (row: any) => {
    const label = String(row?.bom_type_label ?? "")
      .trim()
      .toLowerCase();
    if (label === "sfg") return "semi";
    if (label === "fg") return "default";
    return String(
      row?.bom_recipe_type ??
        row?.recipe_type ??
        row?.type ??
        row?.bom_recipe ??
        "",
    )
      .trim()
      .toLowerCase();
  };
  const isFgType = (type: string) =>
    ["default", "fg", "finished"].includes(type);
  const isSfgType = (type: string) =>
    ["semi", "sfg", "semi-fg", "semifg"].includes(type);
  const toSelectOptions = (rows: any[]) =>
    (rows ?? []).map((row: any) => ({
      text: row?.text ?? row?.subject_name ?? row?.name ?? "",
      value: row?.id ?? row?.subject_id ?? row?.value,
    }));

  const loadFgBomOptions = async (search: any) => {
    const response = await executeFun(
      () => getBomOptions(search, "default"),
      "select",
    );
    if (response.success) {
      const options = toSelectOptions(response.data ?? []);
      setFgBomOptions(options);
    } else {
      setFgBomOptions([]);
    }
  };

  // Load BOM options
  const loadSfgBomOptions = async (search: any) => {
    const response = await executeFun(
      () => getBomOptions(search, "semi"),
      "select",
    );
    if (response.success) {
      const options = toSelectOptions(response.data ?? []);
      setSfgBomOptions(options);
    } else {
      setSfgBomOptions([]);
    }
  };

  // Load Cost Center options
  const loadCostCenterOptions = async (search: any) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select",
    );
    if (response.success) {
      const options: any = convertSelectOptions(response.data);
      setCostCenterOptions(options);
    } else {
      setCostCenterOptions([]);
    }
  };
  const normalizeBomsForPrefill = (projectData: any) => {
    const raw = projectData?.bomSubject ?? projectData?.bom ?? null;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const parsed = list
      .map((item: any) => {
        const recipeType = getRecipeType(item);
        return {
          type: recipeType,
          value: item?.subject_id ?? item?.id ?? item?.value ?? null,
          label:
            item?.display_text ??
            item?.subject_name ??
            item?.name ??
            item?.label ??
            item?.text ??
            "",
        };
      })
      .filter((row: any) => row.value !== null && row.value !== undefined);

    let fg = parsed.find((row: any) => isFgType(row.type));
    let sfg = parsed.find((row: any) => isSfgType(row.type));

    if (!fg && !sfg && parsed.length >= 2) {
      // Backend may return [SFG, FG] when type is absent.
      fg = parsed[1];
      sfg = parsed[0];
    } else if (!fg && !sfg && parsed.length === 1) {
      fg = parsed[0];
    } else {
      if (!fg && sfg && parsed.length > 1) {
        fg = parsed.find((row: any) => String(row.value) !== String(sfg.value));
      }
      if (!sfg && fg && parsed.length > 1) {
        sfg = parsed.find((row: any) => String(row.value) !== String(fg.value));
      }
    }

    return { fg, sfg };
  };
  useEffect(() => {
    if (data && isModalVisible) {
      const { fg, sfg } = normalizeBomsForPrefill(data);
      form.setFieldsValue({
        project: data.project,
        description: data.description || "",
        qty: data.qty || 1,
        fgBom: fg ? { value: fg.value, label: fg.label } : null,
        sfgBom: sfg ? { value: sfg.value, label: sfg.label } : null,
        costcenter: data?.costcenter?.cost_center_key || null,
      });

      if (fg) setFgBomOptions([{ value: fg.value, text: fg.label }]);
      if (sfg) setSfgBomOptions([{ value: sfg.value, text: sfg.label }]);
      if (data.costcenter) {
        setCostCenterOptions([
          {
            value: data.costcenter?.cost_center_key,
            text: data.costcenter?.cost_center_name,
          },
        ]);
      }
    }
  }, [data, isModalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    setFgBomOptions([]);
    setSfgBomOptions([]);
    setCostCenterOptions([]);
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
   
    form
      .validateFields()
      .then((values) => {
        const fgBomId = values?.fgBom?.value ?? values?.fgBom ?? null;
        const sfgBomId = values?.sfgBom?.value ?? values?.sfgBom ?? null;

        if (fgBomId && sfgBomId && String(fgBomId) === String(sfgBomId)) {
          message.error("FG and SFG BOM must be different");
          return;
        }
        const updatedData = {
          project: values.project,
          description: values.description?.trim(),
          qty: values.qty ? Number(values.qty) : 0,
          bomSubject: [fgBomId ?? null, sfgBomId ?? null],
          costcenter: values.costcenter || null,
        };

        onUpdate(updatedData); 
     
      })
      .catch((info) => {
        showToast("Please fill in all required fields.", "error");
      });
  };

  return (
    <Drawer
      title="Update Project"
      open={isModalVisible}
      onClose={handleCancel}
      width={600}
      placement="right"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={isUpdateLoading}>
            Update Project
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="project"
          label="Project ID"
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="description"
          label="Project Description"
          rules={[
            { required: true, message: "Please enter project description" },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter project name/description"
          />
        </Form.Item>
        <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
          <Input type="number" min={1} />
        </Form.Item>
        <Form.Item name="fgBom" label="FG BOM">
          <MyAsyncSelect
            placeholder="Search and select FG BOM..."
            loadOptions={loadFgBomOptions}
            optionsState={fgBomOptions}
            onBlur={() => setFgBomOptions([])}
            labelInValue={true}
          />
        </Form.Item>{" "}
        <Form.Item name="sfgBom" label="SFG BOM">
          <MyAsyncSelect
            placeholder="Search and select SFG BOM..."
            loadOptions={loadSfgBomOptions}
            optionsState={sfgBomOptions}
            onBlur={() => setSfgBomOptions([])}
            labelInValue={true}
          />
        </Form.Item>
        {/* Cost Center Field - Uses its own options */}
        <Form.Item name="costcenter" label="Cost Center">
          <MyAsyncSelect
            placeholder="Search and select Cost Center..."
            loadOptions={loadCostCenterOptions}
            optionsState={costCenterOptions}
            onBlur={() => setCostCenterOptions([])}
            allowClear
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default UpdateProjectModal;

import { useRef, useState } from "react";
import { Select, Spin } from "antd";
import { getComponentOptions, getProjectOptions, getUserOptions } from "../../api/general.ts";

// search-as-you-type select backed by an api, same feel as create PO
// initialOptions lets an existing value (e.g. a saved user id) show its label before any search
export default function SearchSelect({ fetcher, placeholder, value, onChange, onPick, initialOptions = [] }) {
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);
  const timer = useRef();

  const onSearch = (search) => {
    clearTimeout(timer.current);
    if (!search || search.trim().length < 2) return;
    timer.current = setTimeout(async () => {
      setLoading(true);
      const list = await fetcher(search.trim());
      setLoading(false);
      setOptions(list);
    }, 350);
  };

  return (
    <Select
      showSearch
      allowClear
      value={value || undefined}
      placeholder={placeholder}
      filterOption={false}
      onSearch={onSearch}
      notFoundContent={loading ? <Spin size="small" /> : "Type at least 2 characters"}
      options={options}
      onChange={(v, opt) => {
        onChange?.(v ?? "");
        onPick?.(opt);
      }}
    />
  );
}

// "PART - (Name)" -> "Name"
const componentName = (text = "") => {
  const m = text.match(/ - \((.*)\)$/);
  return m ? m[1] : text;
};

export const fetchProjects = async (search) => {
  const response = await getProjectOptions(search);
  return (response.data || []).map((p) => ({ value: p.value, label: p.text }));
};

// active users from admin_login
export const fetchUsers = async (search) => {
  const response = await getUserOptions(search);
  return Array.isArray(response.data) ? response.data.map((u) => ({ value: u.value, label: u.text })) : [];
};

// value is the part code for SKU and the name for Item, so both selects share one fetcher shape
const fetchComponents = (valueOf) => async (search) => {
  const response = await getComponentOptions(search);
  if (!response?.success) return [];
  return response.data.map((c) => ({
    value: valueOf(c),
    label: c.text,
    sku: c.part_code,
    item: componentName(c.text),
    key: c.id,
  }));
};
export const fetchBySku = fetchComponents((c) => c.part_code);
export const fetchByItem = fetchComponents((c) => componentName(c.text));

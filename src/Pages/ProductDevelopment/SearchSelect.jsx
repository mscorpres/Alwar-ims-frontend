import { useRef, useState } from "react";
import { Select, Spin } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import { getProjectOptions, getUserOptions } from "../../api/general.ts";

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

// "(SKU) Name" -> "SKU", the sku itself may contain brackets
const skuFromText = (text = "") => {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")" && --depth === 0) return text.slice(1, i);
  }
  return text;
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

// products master, the saved value is the SKU
export const fetchSkus = async (search) => {
  const response = await imsAxios.post("/backend/getProductByNameAndNo", { search });
  if (!response?.success) return [];
  return response.data.map((p) => ({ value: skuFromText(p.text), label: p.text, key: p.id }));
};

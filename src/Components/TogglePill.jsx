import { Checkbox } from "antd";

const TogglePill = ({
  checked,
  onChange,
  label = "Label",
  value,
  selectedValues,
  onSelectedValuesChange,
}) => {
  const isMulti = Array.isArray(selectedValues) && typeof onSelectedValuesChange === "function";
  const isChecked = isMulti ? selectedValues.includes(value) : !!checked;

  const updateChecked = (nextChecked) => {
    if (isMulti) {
      const exists = selectedValues.includes(value);
      const next = nextChecked
        ? exists
          ? selectedValues
          : [...selectedValues, value]
        : selectedValues.filter((v) => v !== value);
      onSelectedValuesChange(next);
      return;
    }
    onChange?.(nextChecked);
  };

  return (
    <div
      onClick={() => updateChecked(!isChecked)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: 20,
        backgroundColor: isChecked ? "#d9f7be" : "#f0f0f0",
        cursor: "pointer",
        transition: "all 0.3s",
      }}
    >
      <Checkbox
        size="small"
        checked={isChecked}
        onChange={(e) => updateChecked(e.target.checked)}
      />

      <span
        style={{
          fontSize: 14,
          color: "#555",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default TogglePill;
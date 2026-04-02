import dayjs from "dayjs";

/**
 * Ensures Form.Item receives an array for `rules` (Ant Design calls rules.some()).
 * Use for rules from objects (e.g. rules.fieldName) that may be undefined or non-array.
 */
export const normalizeFormRules = (rules: unknown): unknown[] =>
  Array.isArray(rules) ? rules : [];

export const convertSelectOptions = (
  arr: [],
  label?: string,
  value?: string
) => {
  if (arr.map) {
    return arr.map((row) => ({
      text: row[label ?? "text"],
      value: row[value ?? "id"],
    }));
  }
};

export const removeHtml = (value) => {
  return value.replace(/<[^>]*>/g, " ");
};
export const getInt = (value, decimal) => {
  return +Number(value ?? "0").toFixed(decimal ?? 4);
};

export const convertDate = (date, format = "DD-MM-YYYY") => {
  return dayjs(date).format(format);
};

export const downloadFromLink = (uri) => {
  const splitArr = uri.split("/");
  const name = splitArr[splitArr.length - 1];
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // delete link;
};

export function validatePAN(
  pan: string
): { valid: boolean; formattedPAN: string } {
  const formattedPAN = (pan ?? "").trim().toUpperCase();

  if (formattedPAN.length !== 10) {
    return { valid: false, formattedPAN };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const valid = panRegex.test(formattedPAN);
  return { valid, formattedPAN };
}

  export const normalizeSelection = (selection:any) => {
    if (Array.isArray(selection)) return selection.map((id) => String(id));
    if (selection && typeof selection === "object") {
      if (Array.isArray(selection.ids)) {
        return selection.ids.map((id:any) => String(id));
      }
      if (selection.ids && typeof selection.ids.forEach === "function") {
        const ids:any = [];
        selection.ids.forEach((id:any) => ids.push(String(id)));
        return ids;
      }
    }
    return [];
  };

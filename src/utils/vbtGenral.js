export const getPurchaseGlOptions = (rows = []) =>
  Array.from(
    new Map(
      rows
        .flatMap((row) => {
          if (Array.isArray(row.purchaseGLCode)) {
            return row.purchaseGLCode;
          }
          if (row.purchase_gl) {
            return [
              {
                key: row.purchase_gl.value ?? row.purchase_gl.key,
                name:
                  row.purchase_gl.label ??
                  row.purchase_gl.text ??
                  row.purchase_gl.name,
              },
            ];
          }
          return [];
        })
        .filter((gl) => gl?.key != null && String(gl.key).trim() !== "")
        .map((gl) => [gl.key, { text: gl.name ?? gl.key, value: gl.key }]),
    ).values(),
  );

export const resolveGlOptionsList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const mergeGlSelectOptions = (apiRows = [], extraOptions = []) => {
  let arr = apiRows.map((d) => ({
    text: d.text,
    value: d.id,
  }));
  extraOptions.forEach((option) => {
    if (!arr.some((item) => item.value === option.value)) {
      arr.push(option);
    }
  });
  return arr;
};
export const getPurchaseGlCodeValue = (purchaseGLCode, apiUrl) => {
  const glEntry = Array.isArray(purchaseGLCode)
    ? purchaseGLCode[0]
    : purchaseGLCode;
  if (glEntry?.key != null && String(glEntry.key).trim() !== "") {
    return glEntry.key;
  }
  if (isVbt01StyleModule(apiUrl)) return "TP821753548513";
  if (apiUrl === "vbt06") return "TP672531876660";
  return "";
};


export const VBT01_API_PREFIX = "vbt01";

export const isVbt01StyleModule = (apiUrl) =>
  getTallyApiPrefix(apiUrl) === VBT01_API_PREFIX;

export const getVbtApiFromCode = (vbtCode = "") =>
  String(vbtCode).split("/")[0]?.toLowerCase() || "";


export const getVbtScreenType = (routeOrCode = "") => {
  const token = String(routeOrCode).trim().toUpperCase();
  if (token === "VB8" || token === "VBT08" || token.startsWith("VBT08/")) {
    return "VBT08";
  }
  return "VBT01";
};


export const getTallyApiPrefix = (apiUrlOrVbtCode = "") => {
  const prefix = String(apiUrlOrVbtCode).includes("/")
    ? getVbtApiFromCode(apiUrlOrVbtCode)
    : apiUrlOrVbtCode;
  if (prefix === "vbt08") return VBT01_API_PREFIX;
  return prefix;
};


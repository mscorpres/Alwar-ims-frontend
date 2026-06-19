 export const normalizeStateToken = (v) =>
    v == null ? "" : String(v).trim().toLowerCase();

 const mapStateOptionToFieldValue = (opt) => ({
    label: opt?.text ?? opt?.label ?? opt?.value,
    value: opt?.value ?? opt?.id ?? "",
  });

 const findStateInCurrentOptions = (stateInput,arr) => {
    const token = normalizeStateToken(stateInput);
    if (!token) return null;
    return (
      arr.find(
        (o) =>
          normalizeStateToken(o?.value) === token ||
          normalizeStateToken(o?.text) === token ||
          normalizeStateToken(o?.label) === token
      ) || null
    );
  };
  export const vendorTypeOptions = [
  { text: "Import", value: "IMPT" },
  { text: "Domestic", value: "DOM" },
];
export const GSTIN_LENGTH = 15;
export const GSTIN_FETCH_DEBOUNCE_MS = 450;

export const normalizeGstinInput = (value) =>
  String(value ?? "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, GSTIN_LENGTH);

 export const resolveStateFieldValue = async (stateInput, arr) => {
    const raw = stateInput == null ? "" : String(stateInput).trim();
    if (!raw) return null;

    const fromLoaded = findStateInCurrentOptions(raw, arr);
    if (fromLoaded) return mapStateOptionToFieldValue(fromLoaded);

    try {
      const { data } = await imsAxios.post("/backend/stateList", {
        search: raw,
      });
      const fetched =
        Array.isArray(data) && data.length > 0
          ? data.map((d) => ({ text: d.text, value: d.id }))
          : [];

      if (fetched.length > 0) {
        setAsyncOptions((prev) => {
          const merged = [...prev];
          fetched.forEach((item) => {
            if (
              !merged.some(
                (p) =>
                  normalizeStateToken(p?.value) ===
                    normalizeStateToken(item.value) ||
                  normalizeStateToken(p?.text) ===
                    normalizeStateToken(item.text)
              )
            ) {
              merged.push(item);
            }
          });
          return merged;
        });

        const token = normalizeStateToken(raw);
        const exact =
          fetched.find(
            (o) =>
              normalizeStateToken(o?.value) === token ||
              normalizeStateToken(o?.text) === token
          ) || fetched[0];

        return mapStateOptionToFieldValue(exact);
      }
    } catch (e) {
      console.error(e);
    }


    return { label: raw, value: raw };
  };


export  const msmeOptions = [
    { text: "Yes", value: "Y" },
    { text: "No", value: "N" },
  ];
export  const MSME_YEAR_LEGACY = [
    { text: "2023-2024", value: "2023-2024" },
    { text: "2024-2025", value: "2024-2025" },
    { text: "2025-2026", value: "2025-2026" },
    { text: "2026-2027", value: "2026-2027" },
  ];
 export const msmeTypeOptions = [
    { text: "Micro", value: "Micro" },
    { text: "Small", value: "Small" },
    { text: "Medium", value: "Medium" },
  ];
export  const msmeActivityOptions = [
    { text: "Manufacturing", value: "Manufacturing" },
    { text: "Service", value: "Service" },
    { text: "Trading", value: "Trading" },
  ];


  export const transactionTypeOptions = [
  { text: "Cheque", value: "cheque" },
  { text: "e-Fund Transfer", value: "transfer" },
  { text: "UPI", value: "upi" },
  { text: "Other", value: "other" },
  { text: "N/A", value: "na" },
];


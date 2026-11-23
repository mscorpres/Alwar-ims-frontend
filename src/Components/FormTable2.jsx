import { Form, Typography } from "antd";
import { useEffect, memo, useRef, useCallback } from "react";
import { normalizeFormRules } from "../utils/general";
import { Add, Delete } from "@mui/icons-material";

/**
 * `optimized` (opt-in): for large tables (100+ rows).
 *  - no whole-form watch; each row subscribes only to its own values
 *  - rows are memoized (pass stable `columns` / `calculation` from the parent,
 *    e.g. via useMemo / useCallback)
 *  - row calculation runs only when that row's watched values change
 * Without `optimized` the behaviour is unchanged.
 */
const FormTable2 = ({
  form,
  columns,
  listName,
  removableRows,
  allowFirstRowRemove = false,
  watchKeys,
  calculation,
  nonListWatchKeys,
  componentRequiredRef,
  addableRow,
  newRow,
  reverse,
  optimized = false,
  height = "calc(100vh - 200px)",
}) => {
  // Legacy mode: watch the whole form (old behaviour). Optimized mode: watch a
  // path that never exists, i.e. no table-wide re-render.
  const formValues = Form.useWatch(optimized ? NOOP_PATH : undefined, form);
  const removeRef = useRef(null);
  const handleRemove = useCallback((name) => removeRef.current?.(name), []);

  const addRow = (rowTemplate) => {
    const names = columns.map((row) => row.name);
    const obj =
      rowTemplate && typeof rowTemplate === "object"
        ? { ...rowTemplate }
        : {};
    if (!rowTemplate) {
      names.forEach((name) => {
        if (name !== "") obj[name] = "";
      });
    }

    const rows = form.getFieldValue(listName) ?? [];
    const next = Array.isArray(rows) ? rows : [];
    const arr = reverse ? [...next, obj] : [obj, ...next];

    form.setFieldValue(listName, arr);
  };
  return (
    <div
      style={{
        padding: 0,
        overflowY: "auto",
        height: height,
      }}
    >
      <style>{rowHoverCss}</style>
      <table style={{ border: "1px solid #ccc" }}>
        <thead>
          <tr>
            {(addableRow || removableRows) && (
              <td
                className="table-col"
                style={{
                  width: 30,
                  minWidth: 30,
                  textAlign: "center",
                }}
              >
                {addableRow && (
                  <span
                    onClick={() => addRow(newRow)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        addRow(newRow);
                    }}
                  >
                    <Add color="success" />
                  </span>
                )}
              </td>
            )}
            {columns.map((col) =>
              !col.conditional ? (
                <td key={col.name} className="table-col">
                  <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                    {col.headerName}
                  </Typography.Text>
                </td>
              ) : (
                col.condition() && (
                  <td key={col.name} className="table-col">
                    <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                      {col.headerName}
                    </Typography.Text>
                  </td>
                )
              ),
            )}
          </tr>
        </thead>

        <tbody>
          <Form.List
            name={listName}
            style={{
              width: "fit-content",
              height: "100%",
            }}
          >
            {(fields, { remove }) => {
              removeRef.current = remove;
              return fields.map((field, index) =>
                optimized ? (
                  <OptimizedRow
                    key={field.key}
                    name={field.name}
                    removableRows={removableRows}
                    allowFirstRowRemove={allowFirstRowRemove}
                    addableRow={addableRow}
                    remove={handleRemove}
                    index={index}
                    columns={columns}
                    listName={listName}
                    watchKeys={watchKeys}
                    form={form}
                    calculation={calculation}
                    nonListWatchKeys={nonListWatchKeys}
                    componentRequiredRef={componentRequiredRef}
                  />
                ) : (
                  <LegacyRow
                    key={field.key}
                    field={field}
                    formValues={formValues}
                    removableRows={removableRows}
                    allowFirstRowRemove={allowFirstRowRemove}
                    addableRow={addableRow}
                    remove={remove}
                    index={index}
                    columns={columns}
                    listName={listName}
                    watchKeys={watchKeys}
                    form={form}
                    calculation={calculation}
                    nonListWatchKeys={nonListWatchKeys}
                    componentRequiredRef={componentRequiredRef}
                  />
                ),
              );
            }}
          </Form.List>
        </tbody>
      </table>
    </div>
  );
};

export default FormTable2;

/* ------------------------------------------------------------------ */
/* Legacy mode: re-renders every row on any form change (old behaviour) */
/* ------------------------------------------------------------------ */
const NOOP_PATH = ["__formTable2_noop__"];

const LegacyRow = memo(
  ({
    field,
    removableRows,
    allowFirstRowRemove,
    addableRow,
    remove,
    index,
    columns,
    watchKeys = [],
    listName,
    form,
    calculation,
    nonListWatchKeys = [],
    componentRequiredRef = [],
  }) => {
    const watchValues = watchKeys?.map((val) =>
      form.getFieldValue([listName, field.name, val]),
    );
    const nonListWatchValues = nonListWatchKeys?.map((val) =>
      form.getFieldValue(val),
    );
    const valueObj = form.getFieldValue([listName, field.name]);
    useEffect(() => {
      if (calculation) {
        let obj = {};
        watchKeys.forEach((key) => {
          obj[key] = form.getFieldValue([listName, field.name, key]);
        });
        calculation(field.name, obj);
      }
    }, [[...watchValues, ...nonListWatchValues]]);
    return (
      <RowCells
        name={field.name}
        index={index}
        valueObj={valueObj}
        columns={columns}
        listName={listName}
        form={form}
        removableRows={removableRows}
        allowFirstRowRemove={allowFirstRowRemove}
        addableRow={addableRow}
        remove={remove}
        componentRequiredRef={componentRequiredRef}
      />
    );
  },
);
LegacyRow.displayName = "LegacyRow";

/* ------------------------------------------------------------------ */
/* Optimized mode                                                      */
/* ------------------------------------------------------------------ */
const getPath = (obj, key) =>
  (Array.isArray(key) ? key : [key]).reduce((acc, k) => acc?.[k], obj);

const OptimizedRow = memo(
  ({
    name,
    removableRows,
    allowFirstRowRemove,
    addableRow,
    remove,
    index,
    columns,
    watchKeys = [],
    listName,
    form,
    calculation,
    nonListWatchKeys = [],
    componentRequiredRef = [],
  }) => {
    // Re-render only when this row's own values change
    const watchedRow = Form.useWatch([listName, name], form);
    const nonListSig = Form.useWatch(
      (values) =>
        nonListWatchKeys.length
          ? JSON.stringify(nonListWatchKeys.map((k) => getPath(values, k)))
          : "",
      form,
    );
    const valueObj = watchedRow ?? form.getFieldValue([listName, name]) ?? {};

    const watchSig = JSON.stringify(watchKeys.map((k) => valueObj?.[k]));
    useEffect(() => {
      if (!calculation) return;
      const obj = {};
      watchKeys.forEach((key) => {
        obj[key] = form.getFieldValue([listName, name, key]);
      });
      calculation(name, obj);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchSig, nonListSig, name]);

    return (
      <RowCells
        name={name}
        index={index}
        valueObj={valueObj}
        columns={columns}
        listName={listName}
        form={form}
        removableRows={removableRows}
        allowFirstRowRemove={allowFirstRowRemove}
        addableRow={addableRow}
        remove={remove}
        componentRequiredRef={componentRequiredRef}
      />
    );
  },
);
OptimizedRow.displayName = "OptimizedRow";

/* ------------------------------------------------------------------ */
/* Shared row markup                                                   */
/* ------------------------------------------------------------------ */
const RowCells = ({
  name,
  index,
  valueObj,
  columns,
  removableRows,
  allowFirstRowRemove,
  addableRow,
  remove,
  componentRequiredRef = [],
}) => {
  const rowBg = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
  const isComponentRequired = componentRequiredRef.some((key) => {
    const val = valueObj?.[key];
    return val && val.length > 0;
  });

  const renderCell = (row, columnIndex) => (
    <td key={row.name || columnIndex} style={columnCellStyle(row)}>
      <Form.Item
        rules={isComponentRequired ? normalizeFormRules(rules[row.name]) : []}
        name={[name, row.name]}
        style={{
          margin: 0,
          padding: 0,
          display: row.justify && "flex",
          justifyContent: row.justify,
        }}
        validateTrigger="onBlur"
      >
        {row.field({ fieldName: name, ...valueObj }, index)}
      </Form.Item>
    </td>
  );

  return (
    <tr
      align="middle"
      className="form-table2-row"
      style={{ "--row-bg": rowBg }}
    >
      {addableRow && !removableRows && <td style={{ width: 30 }} />}
      {removableRows && (
        <td style={{ width: "2vw", textAlign: "center" }}>
          {(allowFirstRowRemove || index > 0) && (
            <span onClick={() => remove(name)} className="delete-icon">
              <Delete color="error" />
            </span>
          )}
        </td>
      )}
      {columns.map((row, columnIndex) =>
        !row.conditional
          ? renderCell(row, columnIndex)
          : row.condition() && renderCell(row, columnIndex),
      )}
    </tr>
  );
};

// Hover highlight via CSS (no React state → no table-wide re-render on mouse move)
const rowHoverCss = `
.form-table2-row > td { background-color: var(--row-bg); }
.form-table2-row:hover > td { background-color: #fffaec; }
`;

const columnCellStyle = (row) => ({
  whiteSpace: "nowrap",
  width: row.width,
  minWidth: row.width,
  maxWidth: row.maxWidth,
  verticalAlign: "middle",
  padding: "2px 5px",
});

const rules = {
  hsn: [
    {
      required: true,
      message: "Please enter a HSN code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
};

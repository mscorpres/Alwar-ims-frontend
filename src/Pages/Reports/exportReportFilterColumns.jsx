import React from "react";
import { Input } from "antd";

export function createExportReportFilterColumns({
  myDataSelection,
  myDataValues,
  setMyDataValues,
}) {
  return [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 220,
    },
    {
      field: "value",
      headerName: "Value",
      flex: 1,
      minWidth: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isSelected = myDataSelection.includes(String(params.id));
        return (
          <div
            style={{
              width: "250px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingRight: 6,
              opacity: 0.8,
            }}
          >
            <Input
              placeholder="Enter value"
              size="small"
              disabled={!isSelected}
              value={myDataValues?.[params.id] ?? ""}
              onChange={(e) =>
                setMyDataValues((prev) => ({
                  ...(prev || {}),
                  [params.id]: e.target.value,
                }))
              }
              style={{ width: 250 }}
            />
          </div>
        );
      },
    },
  ];
}

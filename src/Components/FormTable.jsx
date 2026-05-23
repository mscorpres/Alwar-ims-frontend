import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export default function FormTable({ columns, data, loading, getRowStyle }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [cells, setCells] = useState([]);
  useEffect(() => {
    let arr = columns.map((row) => {
      return row.headerName;
    });
    let arr1 = columns.map((row) => {
      return row.renderCell({ row });
    });
    setHeaders(arr);
    setCells(arr1);
  }, [columns]);

  return (
    <TableContainer
      style={{ height: "100%", border: "1px solid white", borderRadius: "0px" }}
    >
      {/* <div
        size="small"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          border: "1px solid #ccc",
        }}
      > */}
        <Table
          stickyHeader
          sx={{ width: "100%", overflowX: "auto",    border: "1px solid #ccc", }}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              {columns.map((row, index) => (
                <TableCell
                  sx={{
                    width: `${row.width && row.width}px !important`,
                    maxWidth: `${row.width && row.width}px !important`,
                    minWidth: `${row.width && row.width}px !important`,
                    backgroundColor: "#f1f7fc",
                    padding: "0px",
                    textAlign: "center",
                    fontSize: "14px",
                    border: "1px solid white",
                    borderBottom: "1px solid #c6def4",
                    overflow: "hidden",
                  }}
                  key={index}
                  component="th"
                >
                  {row.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row, rowIndex) => {
              const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";
              const customStyle = getRowStyle?.(row) ?? {};
              const hasHighlight = Boolean(customStyle.backgroundColor);
              const backgroundColor = hoveredRow === row.id
                ? hasHighlight
                  ? "#ffccc7"
                  : "#fffaec"
                : customStyle.backgroundColor ?? rowColor;
              return (
                <TableRow
                  key={row?.id ?? `row-${rowIndex}`}
                  style={{
                    backgroundColor,
                    ...customStyle,
                  }}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((col, index) => (
                    <TableCell
                      key={index}
                      size="small"
                      sx={{
                        width: `${row.width && row.width}px !important`,
                        justifyContent: "center",
                        padding: "2px 5px",
                        border: "none",
                      }}
                    >
                      <div style={{ display: "contents" }}>
                        {col.renderCell({ row })}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
    
    </TableContainer>
  );
}

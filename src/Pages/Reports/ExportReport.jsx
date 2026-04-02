import React, { useMemo, useState } from "react";
import CardExport from "../../Components/CardExport";
import { Typography } from "@mui/material";
import { Button, Checkbox, Input } from "antd";
import MySelect from "../../Components/MySelect";
import TogglePill from "../../Components/TogglePill";
import MyDataTable from "../../Components/MyDataTable";
import { normalizeSelection } from "../../utils/general";
import ScheduleIntervalFields from "./ScheduleIntervalFields";
import { createExportReportFilterColumns } from "./exportReportFilterColumns";
import {
  ALL_COLUMNS,
  MY_DATA_ROWS,
  REPORT_TYPE_OPTIONS,
  SCHEDULE_FREQUENCY_OPTIONS,
} from "./exportReportConstants";

const scheduleRowWrap = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 40,
};

const ExportReport = () => {
  const [value, setValue] = useState(null);
  const [checked, setChecked] = useState(false);
  const [reportName, setReportName] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [selectedCols, setSelectedCols] = useState([]);
  const [myDataSelection, setMyDataSelection] = useState([]);
  const [myDataValues, setMyDataValues] = useState({});
  const [schedule, setSchedule] = useState(null);
  const [scheduleHour, setScheduleHour] = useState(17);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [scheduleWeekDay, setScheduleWeekDay] = useState("sunday");
  const [scheduleMonthDay, setScheduleMonthDay] = useState(1);

  const myDataColumns = useMemo(
    () =>
      createExportReportFilterColumns({
        myDataSelection,
        myDataValues,
        setMyDataValues,
      }),
    [myDataSelection, myDataValues],
  );

  const handleReset = () => {
    setValue(null);
    setChecked(false);
    setReportName("");
    setIsEmailChecked(false);
    setSelectedCols([]);
    setMyDataSelection([]);
    setMyDataValues({});
    setSchedule(null);
    setScheduleHour(17);
    setScheduleMinute(0);
    setScheduleWeekDay("sunday");
    setScheduleMonthDay(1);
  };

  return (
    <div style={{ margin: "10px" }}>
      <CardExport title="Choose Report Type">
        <div style={{ maxWidth: 300 }}>
          <MySelect
            options={REPORT_TYPE_OPTIONS}
            placeholder="Select Report"
            value={value}
            onChange={setValue}
          />
        </div>
      </CardExport>
      {value && (
        <div style={{ marginTop: "15px" }}>
          <CardExport title="Report Schedule">
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={{ fontSize: "14px" }}
            >
              Label
            </Checkbox>
            {checked && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "30px",
                  maxWidth: "100%",
                  alignItems: "flex-start",
                  justifyContent: "start",
                }}
              >
                <div style={{ maxWidth: 250 }}>
                  <Typography fontSize="14px" marginBottom={1} marginTop={2}>
                    Report Name
                  </Typography>
                  <Input
                    placeholder="Report Name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    style={{ maxWidth: 250 }}
                  />
                </div>
                <div style={{ maxWidth: 250, minWidth: 250 }}>
                  <Typography fontSize="14px" marginBottom={1} marginTop={2}>
                    Schedule
                  </Typography>
                  <MySelect
                    options={SCHEDULE_FREQUENCY_OPTIONS}
                    placeholder="Select Frequency"
                    value={schedule}
                    onChange={setSchedule}
                  />
                </div>

                <div style={scheduleRowWrap}>
                  <ScheduleIntervalFields
                    schedule={schedule}
                    scheduleHour={scheduleHour}
                    scheduleMinute={scheduleMinute}
                    scheduleWeekDay={scheduleWeekDay}
                    scheduleMonthDay={scheduleMonthDay}
                    onHourChange={setScheduleHour}
                    onMinuteChange={setScheduleMinute}
                    onWeekDayChange={setScheduleWeekDay}
                    onMonthDayChange={setScheduleMonthDay}
                  />
                </div>
              </div>
            )}
          </CardExport>

          <div style={{ marginTop: "15px" }}>
            <CardExport title="Choose Columns">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {ALL_COLUMNS.map((c) => (
                  <TogglePill
                    key={c.key}
                    value={c.key}
                    label={c.label}
                    selectedValues={selectedCols}
                    onSelectedValuesChange={setSelectedCols}
                  />
                ))}
              </div>

              {selectedCols.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <Typography fontSize="12px" color="text.secondary">
                    Selected: {selectedCols.length}
                  </Typography>
                </div>
              )}
            </CardExport>
          </div>
          <div style={{ marginTop: "15px" }}>
            <CardExport title="Filters">
              <div style={{ height: 220, width: "100%" }}>
                <MyDataTable
                  data={MY_DATA_ROWS}
                  columns={myDataColumns}
                  hideHeaderMenu
                  checkboxSelection
                  disableSelectionOnClick
                  disableRowSelectionOnClick
                  selectionModel={myDataSelection}
                  onSelectionModelChange={(next) =>
                    setMyDataSelection(normalizeSelection(next))
                  }
                  rowSelectionModel={myDataSelection}
                  onRowSelectionModelChange={(next) =>
                    setMyDataSelection(normalizeSelection(next))
                  }
                  hideFooter
                />
              </div>
            </CardExport>
          </div>

          <div style={{ marginTop: "15px" }}>
            <CardExport title="Email Confirmation">
              <Checkbox
                checked={isEmailChecked}
                onChange={(e) => setIsEmailChecked(e.target.checked)}
                style={{ fontSize: "14px" }}
              >
                Send an email when the report is ready
              </Checkbox>
              {isEmailChecked && (
                <div>
                  <Typography fontSize="14px" marginBottom={1} marginTop={2}>
                    Email Address
                  </Typography>
                  <Input
                    placeholder="Enter email address"
                    value={myDataValues?.email || ""}
                    onChange={(e) =>
                      setMyDataValues({
                        ...myDataValues,
                        email: e.target.value,
                      })
                    }
                    style={{ maxWidth: 300 }}
                  />
                </div>
              )}
            </CardExport>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Button onClick={handleReset} style={{ padding: 20 }}>
              Reset
            </Button>
            <Button type="primary" onClick={() => {}} style={{ padding: 20 }}>
              Export Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportReport;

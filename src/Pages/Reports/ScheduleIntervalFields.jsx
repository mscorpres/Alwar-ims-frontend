import React, { memo } from "react";
import { Typography } from "@mui/material";
import { Select } from "antd";
import {
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  WEEKDAY_OPTIONS,
  MONTH_DAY_OPTIONS,
} from "./scheduleOptions";
import { buildScheduleSummaryText } from "./scheduleUtils";
import MySelect from "../../Components/MySelect";

const rowStyle = {
  flex: "1 1 100%",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
  marginTop: 8,
  rowGap: 10,
};

const muted = { fontSize: 14, color: "rgba(0,0,0,0.65)" };

function TimeRow({ hour, minute, onHourChange, onMinuteChange }) {
  return (
    <>
      <span style={muted}>at</span>
      <div style={{width: 72}}>
        <MySelect
          value={hour}
          onChange={onHourChange}
          options={HOUR_OPTIONS}
        />
      </div>
   
      <span style={{ fontSize: 14 }}>:</span>
      <div style={{width: 72}}>
        <MySelect
          value={minute}
          onChange={onMinuteChange}
          options={MINUTE_OPTIONS}
        />
      </div>
    
    </>
  );
}

function ScheduleIntervalFields({
  schedule,
  scheduleHour,
  scheduleMinute,
  scheduleWeekDay,
  scheduleMonthDay,
  onHourChange,
  onMinuteChange,
  onWeekDayChange,
  onMonthDayChange,
}) {
  if (!schedule) return null;

  const summaryText = buildScheduleSummaryText(schedule, {
    scheduleHour,
    scheduleMinute,
    scheduleWeekDay,
    scheduleMonthDay,
  });

  const wrap = (inner) => (
    <div style={rowStyle}>
      {inner}
      <Typography
        fontSize="13px"
        color="text.secondary"
        sx={{ marginLeft: { xs: 0, sm: "auto" } }}
      >
        {summaryText}
      </Typography>
    </div>
  );

  const timeRow = (
    <TimeRow
      hour={scheduleHour}
      minute={scheduleMinute}
      onHourChange={onHourChange}
      onMinuteChange={onMinuteChange}
    />
  );

  switch (schedule) {
    case "day":
      return wrap(timeRow);
    case "week":
      return wrap(
        <>
          <span style={muted}>on</span>

         <div style={{ minWidth: 130 }}>
           <MySelect
          value={scheduleWeekDay}
          onChange={onWeekDayChange}
          options={WEEKDAY_OPTIONS}
        
          />
          </div>
      
          {timeRow}
        </>,
      );
    case "month":
      return wrap(
        <>
          <span style={muted}>on the</span>
          <div style={{ minWidth: 88 }}>
          <MySelect
            value={scheduleMonthDay}
            onChange={onMonthDayChange}
            options={MONTH_DAY_OPTIONS}
          />
          </div>
       
          {timeRow}
        </>,
      );
    default:
      return null;
  }
}

export default memo(ScheduleIntervalFields);

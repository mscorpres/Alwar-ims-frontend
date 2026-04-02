import { WEEKDAY_OPTIONS } from "./scheduleOptions";

export function formatAtTime12h(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = String(minute).padStart(2, "0");
  const hh = String(h12).padStart(2, "0");
  return `At ${hh}:${mm} ${period}`;
}

export function buildScheduleSummaryText(
  schedule,
  { scheduleHour, scheduleMinute, scheduleWeekDay, scheduleMonthDay },
) {
  const timeSummary = formatAtTime12h(scheduleHour, scheduleMinute);
  const weekDayLabel =
    WEEKDAY_OPTIONS.find((o) => o.value === scheduleWeekDay)?.label ?? "Sunday";

  if (schedule === "week") {
    return `${timeSummary}, only on ${weekDayLabel}`;
  }
  if (schedule === "month") {
    return `${timeSummary}, on day ${scheduleMonthDay} of the month`;
  }
  return timeSummary;
}

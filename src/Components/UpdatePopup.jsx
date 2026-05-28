import { useEffect, useState } from "react";

export default function UpdatePopup({ open, onRefresh }) {
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    if (!open) return;
    setSeconds(4);
  }, [open]);

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const timeoutId = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [open, seconds]);

  if (!open) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.notificationBanner}>
        <div style={styles.iconWrapper}>
          <div style={styles.icon}>⚠</div>
        </div>

        <div style={styles.message}>
          New update is available. Please refresh to continue on the latest
          version.
        </div>

        <div style={styles.actions}>
          <div style={styles.countdown}>{seconds}</div>
          <button style={styles.tryAgainBtn} onClick={onRefresh}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 24,
    zIndex: 1200,
    padding: "0 20px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },
  notificationBanner: {
    width: "100%",
    maxWidth: 880,
    background: "linear-gradient(135deg, #fff6e8 0%, #fff9f0 100%)",
    border: "2px solid #f5a962",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 4px 12px rgba(245, 124, 0, 0.1)",
    pointerEvents: "auto",
  },
  iconWrapper: {
    flexShrink: 0,
    width: 44,
    height: 44,
    background: "#ffecd2",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    color: "#f5a962",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: "24px",
    textAlign: "center",
  },
  message: {
    flex: 1,
    color: "#e67726",
    fontSize: 17,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  countdown: {
    width: 48,
    height: 48,
    background: "#fff",
    border: "2px solid #f5a962",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 600,
    color: "#e67726",
  },
  tryAgainBtn: {
    background: "linear-gradient(135deg, #fff6e8 0%, #fff9f0 100%)",
    border: "2px solid #f5a962",
    borderRadius: 12,
    padding: "12px 28px",
    color: "#e67726",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

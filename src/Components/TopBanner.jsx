import React, { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";

const BANNER_STORAGE_KEY = "topBannerClosedAt";
const HIDE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const TopBanner = ({ messages = ["MY message here...."] }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const closedAt = localStorage.getItem(BANNER_STORAGE_KEY);
    
    if (!closedAt) {
      // Never closed before, show banner
      setVisible(true);
    } else {
      const closedTime = parseInt(closedAt, 10);
      const now = Date.now();
      const timePassed = now - closedTime;
      
      if (timePassed >= HIDE_DURATION) {
        // 1 hour has passed, show banner again
        setVisible(true);
        localStorage.removeItem(BANNER_STORAGE_KEY);
      } else {
        // Still within 1 hour, keep hidden
        setVisible(false);
        
        // Set timeout to show banner after remaining time
        const remainingTime = HIDE_DURATION - timePassed;
        const timer = setTimeout(() => {
          setVisible(true);
          localStorage.removeItem(BANNER_STORAGE_KEY);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : messages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < messages.length - 1 ? prev + 1 : 0));
  };

  if (!visible || messages.length === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        background: "#d2f571",
        color: "#12120E",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 1000,
        fontWeight: 400,
        fontSize: "13px",
        borderBottom: "1px solid #b8d95f",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: 1,
        }}
      >
        <InfoCircleOutlined style={{ color: "#203624", fontSize: "14px" }} />
        <span style={{ color: "#203624", fontWeight: 600 }}>Information</span>
        <span style={{ color: "#4a5a3a", margin: "0 4px" }}>|</span>
        <span style={{ color: "#12120E" }}>{messages[currentIndex]}</span>
      </div>
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={handlePrev}
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <LeftOutlined style={{ fontSize: "10px" }} />
        </button>
        <span style={{ color: "#555", fontSize: "12px" }}>
          {currentIndex + 1}/{messages.length}
        </span>
        <button
          onClick={handleNext}
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <RightOutlined style={{ fontSize: "10px" }} />
        </button>
        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            cursor: "pointer",
            padding: "4px",
            marginLeft: "8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <CloseOutlined style={{ fontSize: "12px" }} />
        </button>
      </div>
    </div>
  );
};

export default TopBanner;

import React from "react";
import { Layout } from "antd";
import Calculator from "./Calculator";
import "./CalculatorDrawer.css";

const { Sider } = Layout;

const CalculatorDrawer = ({ open, onClose }) => {
  return (
    <Sider
      className="calculator-sidebar"
      width={400}
      collapsed={!open}
      collapsedWidth={0}
      trigger={null}
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100vh",
        zIndex: 100,
        background: "#fff",
        boxShadow: open ? "-2px 0 8px rgba(0,0,0,0.15)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="calculator-sidebar-content">
        <div className="calculator-sidebar-body">
          <Calculator onClose={onClose} />
        </div>
      </div>
    </Sider>
  );
};

export default CalculatorDrawer;

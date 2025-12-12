import React from "react";
import "../index.css";
import Sider from "antd/lib/layout/Sider";
import { Menu } from "antd";

const Sidebar = ({ showSideBar, setShowSideBar, items, items1, ...props }) => {
  const {isBannerVisible} = props
  return (
    <Sider
      style={{
        height: isBannerVisible ? "calc(100vh - 50px)" : "100vh",
        zIndex: 99,
        overflowY: "auto",
      }}
      width={230}
      collapsedWidth={50}
      collapsed={!showSideBar}
      onCollapse={(value) => setShowSideBar(value)}
    >
      <Menu
        theme="dark"
        // forceSubMenuRender
        style={{ height: "70%", background: "transparent", overflowY: "auto" }}
        defaultSelectedKeys={["1"]}
        mode="inline"
        triggerSubMenuAction="hover"
        inlineCollapsed={!showSideBar}
        items={items}
      />
      {/* //item 2 removed  */}
      <Menu
        theme="dark"
        // forceSubMenuRender
        style={{
          height: "30%",
          background: "transparent",
       
          display: "flex",
          flexDirection: "column",
          paddingBottom: 50,
          justifyContent: "flex-end",
        }}
        defaultSelectedKeys={["1"]}
        mode="inline"
        inlineCollapsed={!showSideBar}
        items={items1}
      />
    </Sider>
  );
};
export default Sidebar;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "./Features/Store";
import "./index.css";
// import { unregister as unregisterServiceWorker } from "./serviceWorkerRegistration";
import { ConfigProvider } from "antd";
import { customColor } from "./utils/customColor";

const theme = {
  token: {
    colorPrimary: "#203624",
    colorInfo: "#203624",
    colorSuccess: "#203624",
    fontSizeHeading5: 16,
    // colorTextLightSolid: "#12120E",
  },
  components: {
    Button: {
      colorText: "#fff",
      colorPrimary: customColor.btnColor,
      colorPrimaryHover: "#0d9489cd",
      colorPrimaryActive: "#0d9489",
      primaryColor: "#fff",
      // defaultBg: "",
      defaultColor: "#000",
      // defaultHoverBg: "#0d9489",
      // defaultActiveBg: "#0d9489",
      fontWeight: 550,
    },
    Tabs: {
      colorText: "#12120E",
      itemSelectedColor: "#203624",
      inkBarColor: "#203624",
    },
    Divider: {
      verticalMarginInline: 4,
      margin: 5,
      marginLG: 8,
    },

    Form: {
      margin: 4,
      labelColonMarginInlineEnd: 4,
      labelHeight: 0,
      itemMarginBottom: 10,
      lineHeight: 1.0,
    },
    Drawer: {
      paddingLG: 15,
      padding: 10,
      paddingXS: 20,
    },
    Menu: {
      colorText: "rgba(115, 115, 115, 0.88)",
      itemColor: "rgba(115, 115, 115, 0.88)",
      collapsedIconSize: 18,
      itemHeight: 50,
      // padding: 32,
      // itemPaddingInline: 24,
    },
    Select: {
      optionFontSize: 13,
    },
    Tag: {
      marginXS: 4,
      margin: 4,
    },
    Tooltip: {
      colorBgSpotlight: "#0d9489",
      colorTextLightSolid: "#fff",
    },
    Card: {
      headerFontSizeSM: 16,
      headerFontSize: 18,
      colorBgContainer: "#f5f5f2",
    },
    DatePicker: {
      cellHoverBg: "#d2f571",
      cellActiveWithRangeBg: "rgba(210, 245, 113, 0.3)",
      cellHoverWithRangeBg: "rgba(210, 245, 113, 0.3)",
      presetsWidth: 120,
    },
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
// unregisterServiceWorker();
root.render(
  <ConfigProvider theme={theme}>
    <Provider store={Store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </ConfigProvider>
);

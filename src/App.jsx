import React, { useState, useEffect, useRef } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Rout from "./Routes/Routes";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "buffer";
import {
  logout,
  setNotifications,
  setFavourites,
  setTestPages,
  setCompanyBranch,
  setCurrentLink,
  setSession,
} from "./Features/loginSlice/loginSlice.js";
import UserMenu from "./Components/UserMenu";
import Logo from "./Components/Logo";
import socket from "./Components/socket.js";
import Notifications from "./Components/Notifications";
// antd imports
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Badge, Row, Select, Space, Switch, Typography, Modal, Card } from "antd";
// icons import
import {
  CustomerServiceOutlined,
  BellFilled,
  StarFilled,
  StarOutlined,
  MenuOutlined,
  LoadingOutlined,
  SearchOutlined,
  SwapOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Tooltip, IconButton } from "@mui/material";
import { SiSocketdotio } from "react-icons/si";
import InternalNav from "./Components/InternalNav";
import { imsAxios } from "./axiosInterceptor";
import MyAsyncSelect from "./Components/MyAsyncSelect";
import internalLinks from "./Pages/internalLinks.jsx";
import TicketsModal from "./Components/TicketsModal/TicketsModal";
import { items, items1 } from "./utils/sidebarRoutes.jsx";
// import TopBanner from "./Components/TopBanner";
import SettingDrawer from "./Components/SettingDrawer.jsx";

const App = () => {
  const { user, notifications, testPages } = useSelector(
    (state) => state.login
  );

  const filteredRoutes = Rout.filter((route) => {
    // Include the route if it doesn't have a "dept" property or if showlegal is true
    return !route.dept || user?.showlegal;
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSideBar, setShowSideBar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [showMessageNotifications, setShowMessageNotifications] =
    useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const { pathname } = useLocation();
  const [testToggleLoading, setTestToggleLoading] = useState(false);
  const [testPage, setTestPage] = useState(false);
  const [branchSelected, setBranchSelected] = useState(true);
  const [modulesOptions, setModulesOptions] = useState([]);
  const [searchModule, setSearchModule] = useState("");
  const [showTickets, setShowTickets] = useState(false);
  const [searchHis, setSearchHis] = useState("");
  const [hisList, setHisList] = useState([]);
  const [showHisList, setShowHisList] = useState([]);
  const notificationsRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [showSwitchModule, setShowSwitchModule] = useState(false);
  const [alwarSession, setAlwarSession] = useState(null);
  const [alwarBranch, setAlwarBranch] = useState(null);
  const [noidaSession, setNoidaSession] = useState(null);
  const [noidaBranch, setNoidaBranch] = useState(null);
  // Edit mode states for switch module dropdowns
  const [editAlwarSession, setEditAlwarSession] = useState(false);
  const [editAlwarBranch, setEditAlwarBranch] = useState(false);
  const [editNoidaSession, setEditNoidaSession] = useState(false);
  const [editNoidaBranch, setEditNoidaBranch] = useState(false);

  const logoutHandler = () => {
    dispatch(logout());
  };
  const deleteNotification = (id) => {
    let arr = notifications;
    arr = arr.filter((not) => not.ID != id);
    dispatch(setNotifications(arr));
  };

  const handleFavPages = async (status) => {
    let favs = user.favPages;

    if (!status) {
      setFavLoading(true);
      const response = await imsAxios.post("/backend/favouritePages", {
        pageUrl: pathname,
        source: "react",
      });
      setFavLoading(false);
      if (data.success) {
        favs = JSON.parse(data.data);
      } else {
        toast.error(data.message?.msg || data.message);
      }
    } else {
      let page_id = favs.filter((f) => f.url == pathname)[0].page_id;
      setFavLoading(true);
      const response = await imsAxios.post("/backend/removeFavouritePages", {
        page_id,
      });
      setFavLoading(false);
      if (data.success) {
        let fav = JSON.parse(data.data);
        favs = fav;
      } else {
        toast.error(data.message?.msg || data.message);
      }
    }
    dispatch(setFavourites(favs));
  };
  const handleChangePageStatus = (value) => {
    let status = value ? "TEST" : "LIVE";
    socket.emit("setPageStatus", {
      page: pathname,
      status: status,
    });
    setTestToggleLoading(true);
    setTestPage(value);
  };
  const handleSelectCompanyBranch = (value) => {
    dispatch(setCompanyBranch(value));
    setBranchSelected(true);
    socket.emit("getBranch", value);
  };
  const handleSelectSession = (value) => {
    dispatch(setSession(value));
  };

  const getModuleSearchOptions = (search) => {
    let arr = [];
    let modOpt = [];
    internalLinks.map((row) => {
      let a = row;
      arr.push(...a);
    });
    arr.map((row) => {
      if (row.routeName?.toLowerCase().includes(search)) {
        let obj = {
          label: row.routeName,
          value: row.routePath,
        };
        modOpt.push(obj);
      }
    });
    setSearchHis(modOpt);
    setModulesOptions(modOpt);
  };
  useEffect(() => {
    if (modulesOptions?.length === 0) {
      setModulesOptions(showHisList);
    }
  }, [modulesOptions]);
  // notifications recieve handlers
  socket.on("connect", () => {
    console.log("WebSocket connected!!!!");
    setIsConnected(true);
    setIsLoading(false);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    setIsConnected(false);
    setIsLoading(false);
  });

  socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
    setIsConnected(false);
    setIsLoading(false);
  });
  useEffect(() => {
    const otherData = JSON.parse(localStorage.getItem("otherData"));

    if (Notification.permission == "default") {
      Notification.requestPermission();
    }
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        setShowSideBar(false);
      }
    });
    if (!user) {
      navigate("/login");
    }
    if (user) {
      if (user.company_branch) {
        setBranchSelected(true);
      }
    }
    if (user) {
      if (!user.company_branch) {
      }
      if (user.company_branch) {
        setBranchSelected(true);
      }
      socket.emit("fetch_notifications", {
        source: "react",
      });
    }

    if (user && user.token) {
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        arr = arr.map((row) => {
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
            message: JSON.parse(row.other_data)?.message,
          };
        });
        dispatch(setNotifications(arr));
      });
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file" || data[0].msg_type == "msg") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.req_date,
                file: JSON.parse(data.other_data).fileUrl,
                message: JSON.parse(data.other_data)?.message,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });

      // event for starting detail
      socket.on("download_start_detail", (data) => {
        toast.success("Your report has been started generating");
        if (data.title || data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        setTestToggleLoading(false);
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          let obj = {
            url: property,
            status: data[property],
          };
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        toast.error(data.message);
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
      socket.on("getting-loading-percentage", (data) => {
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                total: data.total,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, []);
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user) {
      let branch = JSON.parse(
        localStorage.getItem("otherData")
      )?.company_branch;
      if (branch) {
        setBranchSelected(true);
        // toast.error(
        //   "Please select a company branch before working on any modules"
        // );
      }
      // handleSelectSession("23-24");
    }
  }, [user]);
  useEffect(() => {
    if (pathname === "/login" && user) {
      const link = JSON.parse(localStorage.getItem("otherData"))?.currentLink;
      if (user.passwordChanged === "P") {
        navigate("/first-login");
      } else {
        navigate(link ?? "/");
      }
    }
    if (user && user.token) {
      imsAxios.defaults.headers["x-csrf-token"] = user.token;
      imsAxios.defaults.headers["Company-Branch"] =
        user.company_branch || "BRMSC012";
      imsAxios.defaults.headers["Session"] = user.session || "25-26";
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.status,
                file: JSON.parse(data.other_data).fileUrl,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        arr = arr.map((row) => {
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
          };
        });
        dispatch(setNotifications(arr));
      });
      // event for starting detail
      socket.on("download_start_detail", (data) => {
        if (data.title && data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        setTestToggleLoading(false);
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          let obj = {
            url: property,
            status: data[property],
          };
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        toast.error(data.message);
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, [user?.token]);

  useEffect(() => {
    setShowSideBar(false);
    setShowMessageNotifications(false);
    setShowNotifications(false);
    let currentLink = pathname;
    if (user) {
      if (pathname !== "login") {
        dispatch(setCurrentLink(currentLink));
        if (user.passwordChanged === "P") {
          navigate("/first-login");
        }
      }
    }
  }, [navigate]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  useEffect(() => {
    if (newNotification?.type) {
      if (Notification.permission == "default") {
        Notification.requestPermission(function (permission) {
          if (permission === "default") {
            let notification = new Notification(newNotification.title, {
              body: newNotification.message,
            });
            notification.onclick = () => {
              notification.close();
              window.parent.focus();
            };
          }
        });
      } else {
        let notification = new Notification(newNotification?.title, {
          body: newNotification?.message,
        });
        notification.onclick = () => {
          notification.close();
          window.parent.focus();
        };
      }
    }
  }, [newNotification]);
  useEffect(() => {
    if (showMessageNotifications) {
      {
        setShowNotifications(false);
      }
    }
  }, [showMessageNotifications]);
  useEffect(() => {
    if (showNotifications) {
      {
        setShowMessageNotifications(false);
      }
    }
  }, [showNotifications]);
  useEffect(() => {
    if (testPages) {
      let match = testPages?.filter((page) => page.url == pathname)[0];
      if (match) {
        setTestPage(true);
      } else {
        setTestPage(false);
      }
    }
  }, [navigate, user]);
  useEffect(() => {
    window.addEventListener("offline", (e) => {
      console.log("offline", e);
      toast(
        "You are no longer connected to the Internet, please check your connection and try again."
      );
    });
    window.addEventListener("online", (e) => {
      toast(
        "The internet has been restored. Kindly review your progress to ensure there is no duplication of data."
      );
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    setModulesOptions([]);
    if (searchModule.length > 2) {
      let searching = searchHis.filter((i) => i.value === searchModule);
      // setHisList([...hisList,searching]);
      let a = hisList.push(...hisList, ...searching);
      const ids = hisList.map(({ text }) => text);
      const filtered = hisList.filter(
        ({ text }, index) => !ids.includes(text, index + 1)
      );
      localStorage.setItem("searchHistory", JSON.stringify({ filtered }));

      navigate(searchModule);
    }
  }, [searchModule]);

  const showRecentSearch = () => {
    let obj = JSON.parse(localStorage.getItem("searchHistory"));
      let arr = obj?.filtered?.map((row) => ({
      text: row.text,
      value: row.value,
    }));
    setShowHisList(arr);
  };

  const options = [
    { label: "A-21 [BRMSC012]", value: "BRMSC012" },
    { label: "B-29 [BRMSC029]", value: "BRMSC029" },
    { label: "B-36 Alwar [BRBA036]", value: "BRBA036" },
    { label: "D-160 [BRBAD116]", value: "BRBAD116" },
  ];
  const sessionOptions = [
    { label: "Session 22-23", value: "22-23" },
    { label: "Session 23-24", value: "23-24" },
    { label: "Session 24-25", value: "24-25" },
    { label: "Session 25-26", value: "25-26" },
  ];

  // Location-wise branch options for Switch Module modal
  const locationBranchOptions = {
    alwar: [
      { label: "B-36 Alwar [BRBA036]", value: "BRBA036" },
    ],
    noida: [
      { label: "A-21 [BRMSC012]", value: "BRMSC012" },
      { label: "B-29 [BRMSC029]", value: "BRMSC029" },
      { label: "D-160 [BRBAD116]", value: "BRBAD116" },
    ],
  };

  const handleSwitchModule = (location, branch, session) => {
    dispatch(setCompanyBranch(branch));
    dispatch(setSession(session));
    socket.emit("getBranch", branch);
    setShowSwitchModule(false);
    // Reset edit modes
    setEditAlwarSession(false);
    setEditAlwarBranch(false);
    setEditNoidaSession(false);
    setEditNoidaBranch(false);
    toast.success(`Switched to ${location} - ${branch}`);
  };

  // Helper to get label from value
  const getSessionLabel = (value) => {
    const found = sessionOptions.find((opt) => opt.value === value);
    return found ? found.label : value || "Select Session";
  };

  const getBranchLabel = (value, location) => {
    const options = location === "alwar" ? locationBranchOptions.alwar : locationBranchOptions.noida;
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : "Select Branch";
  };
  const path = window.location.hostname;

  const refreshConnection = () => {
    setIsLoading(true);
    socket.close();
    socket.open();
  };

  return (
    <div style={{ height: "100vh" }}>
      <ToastContainer
        position="bottom-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        limit={1}
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />
      {/* <TopBanner /> */}
      <Layout
        style={{
          width: "100%",
          top: 0,
        }}
      >
        {/* header start */}

        {(path.includes("dev.mscorpres") || path.includes("localhost")) && (
          <div
            style={{
              backgroundColor: "yellow",
              height: "15px",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            TEST SERVER
          </div>
        )}
        {user && user.passwordChanged === "C" && (
          <Layout style={{ height: "100%" }}>
            <Header
              style={{
                zIndex: 4,
                height: 45,
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Row style={{ width: "100%" }} justify="space-between">
                <Space size="large">
                  <MenuOutlined
                    onClick={() => {
                      setShowSideBar((open) => !open);
                    }}
                    style={{
                      color: "white",
                      marginLeft: 12,
                      fontSize: window.innerWidth > 1600 && "1rem",
                    }}
                  />

                  <Link to="/">
                    <Space
                      style={{
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      <Logo />
                      <span style={{ color: "white" }}>IMS</span>
                    </Space>
                  </Link>
                  <div className="location-select">
                    <Select
                      style={{ width: 200, color: "white" }}
                      options={options}
                      variant="borderless"
                      placeholder="Select Company Branch"
                      onChange={(value) => handleSelectCompanyBranch(value)}
                      value={user.company_branch}
                      disabled
                    />
                  </div>
                  <div className="location-select">
                    <Select
                      style={{ width: 200, color: "white" }}
                      options={sessionOptions}
                      variant="borderless"
                      placeholder="Select Session"
                      onChange={(value) => handleSelectSession(value)}
                      value={user.session}
                    />
                  </div>
                </Space>
                <Space>
                  <Select
                    showSearch
                    placeholder="Search..."
                    value={searchModule || undefined}
                    onChange={(value) => {
                      setSearchModule(value);
                      navigate(value);
                    }}
                    onSearch={(value) => {
                      if (value.length > 2) {
                        getModuleSearchOptions(value.toLowerCase());
                      } else {
                        setModulesOptions([]);
                      }
                    }}
                    options={
                      modulesOptions.length > 0 ? modulesOptions : showHisList
                    }
                    filterOption={false}
                    notFoundContent={null}
                    style={{
                      width: 200,
                    }}
                    className="header-search-select"
                    suffixIcon={
                      <SearchOutlined
                        style={{ color: "rgba(0, 0, 0, 0.45)" }}
                      />
                    }
                    onFocus={() => {
                      if (showHisList.length === 0) {
                        showRecentSearch();
                      }
                    }}
                  />
                </Space>
                <Space
                  size="large"
                  style={{
                    position: "relative",
                  }}
                >
                  <Tooltip title="Switch Module" placement="bottom">
                    <SwapOutlined
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowSwitchModule(true)}
                    />
                  </Tooltip>
                  
                  <Tooltip
                    title={`Socket ${
                      isConnected ? "Connected" : "Disconnected"
                    }`}
                    placement="bottom"
                  >
                    <IconButton
                      onClick={() => refreshConnection()}
                      disabled={isLoading}
                    >
                      <SiSocketdotio
                        style={{
                          fontSize: "25px",
                          color: isConnected ? "#10b981" : "#ef4444",
                          animation: isLoading
                            ? "spin 1s linear infinite"
                            : "none",
                        }}
                      />
                    </IconButton>
                  </Tooltip>

                  <div>
                    <Badge
                      size="small"
                      style={{
                        background: notifications.filter(
                          (not) => not?.loading || not?.status == "pending"
                        )[0]
                          ? "#EAAE0F"
                          : "green",
                      }}
                      count={
                        notifications.filter((not) => not?.type != "message")
                          ?.length
                      }
                    >
                      <BellFilled
                        onClick={() => setShowNotifications((n) => !n)}
                        style={{
                          fontSize: 18,
                          color: "white",
                          // marginRight: 8,
                        }}
                      />
                    </Badge>
                    {showNotifications && (
                      <Notifications
                        source={"notifications"}
                        showNotifications={showNotifications}
                        notifications={notifications.filter(
                          (not) => not?.type != "message"
                        )}
                        deleteNotification={deleteNotification}
                      />
                    )}
                  </div>
                  <div>
                    <Badge
                      size="small"
                      count={
                        notifications.filter((not) => not?.type == "message")
                          .length
                      }
                    >
                      <CustomerServiceOutlined
                        onClick={() => setShowTickets(true)}
                        style={{
                          fontSize: 18,
                          cursor: "pointer",
                          color: "white",
                        }}
                      />
                    </Badge>
                  </div>
                  <UserMenu
                    user={user}
                    logoutHandler={logoutHandler}
                    setShowSettings={setShowSetting}
                  />
                  {showSetting && (
                    <SettingDrawer
                      open={showSetting}
                      hide={() => setShowSetting(false)}
                    />
                  )}
                  {/* Switch Module Modal */}
                  <Modal
                    title="Switch Module"
                    open={showSwitchModule}
                    onCancel={() => {
                      setShowSwitchModule(false);
                      setEditAlwarSession(false);
                      setEditAlwarBranch(false);
                      setEditNoidaSession(false);
                      setEditNoidaBranch(false);
                    }}
                    footer={null}
                    width={650}
                    centered
                    maskClosable={false}
                  >
                    <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "20px 0" }}>
                      {/* Alwar Card */}
                      <Card
                        title={<span style={{ fontWeight: "bold", fontSize: 18 }}>Alwar</span>}
                        style={{
                          width: 280,
                          border: "2px solid #047780",
                          borderRadius: 4,
                          boxShadow: "0 4px 12px rgba(4, 119, 128, 0.2)",
                        }}
                        styles={{ body: { padding: 16 } }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div>
                            <div style={{ fontWeight: 500, marginBottom: 6 }}>Session</div>
                            {editAlwarSession ? (
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Select Session"
                                options={sessionOptions}
                                value={alwarSession || user?.session}
                                onChange={(value) => {
                                  setAlwarSession(value);
                                  setEditAlwarSession(false);
                                }}
                                autoFocus
                                open
                              />
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "4px 11px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: 6,
                                  minHeight: 32,
                                }}
                              >
                                <span>{getSessionLabel(alwarSession || user?.session)}</span>
                                <EditOutlined
                                  style={{ cursor: "pointer", color: "#1890ff" }}
                                  onClick={() => setEditAlwarSession(true)}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, marginBottom: 6 }}>Branch</div>
                            {editAlwarBranch ? (
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Select Branch"
                                options={locationBranchOptions.alwar}
                                value={alwarBranch}
                                onChange={(value) => {
                                  setAlwarBranch(value);
                                  setEditAlwarBranch(false);
                                }}
                                autoFocus
                                open
                              />
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "4px 11px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: 6,
                                  minHeight: 32,
                                }}
                              >
                                <span>{getBranchLabel(alwarBranch, "alwar")}</span>
                                <EditOutlined
                                  style={{ cursor: "pointer", color: "#1890ff" }}
                                  onClick={() => setEditAlwarBranch(true)}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            style={{
                              marginTop: 8,
                              padding: "8px 16px",
                              background: "#047780",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              if (!alwarBranch) {
                                toast.error("Please select a branch");
                                return;
                              }
                              handleSwitchModule("Alwar", alwarBranch, alwarSession || user?.session);
                            }}
                          >
                            Switch to Alwar
                          </button>
                        </div>
                      </Card>

                      {/* Noida Card */}
                      <Card
                        title={<span style={{ fontWeight: "bold", fontSize: 18 }}>Noida</span>}
                        style={{
                          width: 280,
                          border: "2px solid #047780",
                          borderRadius: 4,
                          boxShadow: "0 4px 12px rgba(4, 119, 128, 0.2)",
                        }}
                        styles={{ body: { padding: 16 } }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div>
                            <div style={{ fontWeight: 500, marginBottom: 6 }}>Session</div>
                            {editNoidaSession ? (
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Select Session"
                                options={sessionOptions}
                                value={noidaSession || user?.session}
                                onChange={(value) => {
                                  setNoidaSession(value);
                                  setEditNoidaSession(false);
                                }}
                                autoFocus
                                open
                              />
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "4px 11px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: 6,
                                  minHeight: 32,
                                }}
                              >
                                <span>{getSessionLabel(noidaSession || user?.session)}</span>
                                <EditOutlined
                                  style={{ cursor: "pointer", color: "#1890ff" }}
                                  onClick={() => setEditNoidaSession(true)}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, marginBottom: 6 }}>Branch</div>
                            {editNoidaBranch ? (
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Select Branch"
                                options={locationBranchOptions.noida}
                                value={noidaBranch || "BRMSC012"}
                                onChange={(value) => {
                                  setNoidaBranch(value);
                                  setEditNoidaBranch(false);
                                }}
                                autoFocus
                                open
                              />
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "4px 11px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: 6,
                                  minHeight: 32,
                                }}
                              >
                                <span>{getBranchLabel(noidaBranch || "BRMSC012", "noida")}</span>
                                <EditOutlined
                                  style={{ cursor: "pointer", color: "#1890ff" }}
                                  onClick={() => setEditNoidaBranch(true)}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            style={{
                              marginTop: 8,
                              padding: "8px 16px",
                              background: "#047780",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              handleSwitchModule("Noida", noidaBranch || "BRMSC012", noidaSession || user?.session);
                            }}
                          >
                            Switch to Noida
                          </button>
                        </div>
                      </Card>
                    </div>
                  </Modal>
                </Space>
              </Row>
            </Header>
          </Layout>
        )}
        {/* header ends */}
        {/* sidebar starts */}
        <Layout
          style={{
            height: "100%",
            opacity: user && !branchSelected ? 0.5 : 1,
            pointerEvents: user && !branchSelected ? "none" : "all",
          }}
        >
          <TicketsModal
            open={showTickets}
            handleClose={() => setShowTickets(false)}
          />
          {user && user.passwordChanged === "C" && (
            <Sidebar
              items={items(user)}
              items1={items1(user, setShowTickets)}
              className="site-layout-background"
              key={1}
              setShowSideBar={setShowSideBar}
              showSideBar={showSideBar}
            />
          )}
          {/* sidebar ends */}
          <Layout
            onClick={() => {
              setShowNotifications(false);
              setShowMessageNotifications(false);
            }}
            style={{ height: "100%" }}
          >
            <Content style={{ height: "100%" }}>
              <InternalNav links={internalLinks} />

              <div
                style={{
                  height: "calc(100vh - 50px)",
                  width: "100%",
                  opacity: testPage ? 0.5 : 1,
                  pointerEvents:
                    testPage && user?.type != "developer" ? "none" : "all",

                  overflowX: "hidden",
                }}
              >
                <Routes>
                  {filteredRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.main />}
                    />
                  ))}
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;

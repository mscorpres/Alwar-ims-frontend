import React, { useState, useEffect, useRef } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
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
import { Badge, Row, Select, Space, Modal, Button } from "antd";
// icons import
import {
  CustomerServiceOutlined,
  BellFilled,
  MenuOutlined,
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
import TopBanner from "./Components/TopBanner";
import SettingDrawer from "./Components/SettingDrawer.jsx";
import CheckmarkLoader from "./Components/CheckmarkLoader";
import { customColor } from "./utils/customColor.js";

const App = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("previousToken");

  const { user, notifications, testPages } = useSelector(
    (state) => state.login
  );
  const comid = JSON.parse(localStorage.getItem("loggedInUser"))?.comId;

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
  const [editAlwarSession, setEditAlwarSession] = useState(false);
  const [editAlwarBranch, setEditAlwarBranch] = useState(false);
  const [editNoidaSession, setEditNoidaSession] = useState(false);
  const [editNoidaBranch, setEditNoidaBranch] = useState(false);
  const [isSwitchingModule, setIsSwitchingModule] = useState(false);
  const [switchingLocation, setSwitchingLocation] = useState(null);
  const [switchLocation, setSwitchLocation] = useState(null);
  const [switchBranch, setSwitchBranch] = useState(null);
  const [switchSession, setSwitchSession] = useState(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const company = JSON.parse(localStorage.getItem("loggedInUser"));

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
    setIsConnected(false);
    setIsLoading(false);
  });

  useEffect(() => {
    if (tokenFromUrl) {
      localStorage.setItem("newToken", tokenFromUrl);
      localStorage.removeItem("loggedInUser");
      navigate("/login");
    }
  }, [tokenFromUrl]);
  useEffect(() => {
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
  }, [tokenFromUrl]);
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user) {
      let branch = JSON.parse(
        localStorage.getItem("otherData")
      )?.company_branch;
      if (branch) {
        setBranchSelected(true);
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
      const tokenToUse = localStorage.getItem("newToken") || user.token;
      imsAxios.defaults.headers["x-csrf-token"] = tokenToUse;
      imsAxios.defaults.headers["Company-Branch"] =
        user.company_branch || "BRALWR36";
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

  // Show black screen after TopBanner renders for some time
  useEffect(() => {
    if (user && user.passwordChanged === "C") {
      const timer = setTimeout(() => {
        setShowBlackScreen(true);
      }, 1500); // Show black screen after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [user]);

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
    { label: "B36 [ALWAR]", value: "BRALWR36" },
    { label: "D-160 [BRBAD116]", value: "BRBAD116" },
  ];
  const sessionOptions = [
    { label: "Session 22-23", value: "22-23" },
    { label: "Session 23-24", value: "23-24" },
    { label: "Session 24-25", value: "24-25" },
    { label: "Session 25-26", value: "25-26" },
  ];

  const locationBranchOptions = {
    alwar: [{ label: "B36 [ALWAR]", value: "BRALWR36" }],
    noida: [
      { label: "A-21 [BRMSC012]", value: "BRMSC012" },
      { label: "B-29 [BRMSC029]", value: "BRMSC029" },
      { label: "D-160 [BRBAD116]", value: "BRBAD116" },
    ],
  };

  const handleSwitchModule = async (location, branch, session) => {
    setIsSwitchingModule(true);
    setSwitchingLocation(location.toLowerCase());
    const company = location === "alwar" ? "com0002" : "com0001";
    try {
      const existing = JSON.parse(localStorage.getItem("loggedInUser")) || {};
      const previousToken = existing?.token;
      const response = await imsAxios.post(`/auth/switch?company=${company}`);
      const isSuccess = response?.success ?? false;
      const newToken = response?.data?.token;
      const responseMessage = response?.message;

      if (isSuccess && newToken) {
        // Show success checkmark
        setSwitchSuccess(true);

        setTimeout(() => {
          toast.success(`Switched to ${location} - ${branch}`);
          dispatch(setCompanyBranch(branch));
          dispatch(setSession(session));
          socket.emit("getBranch", branch);

          localStorage.setItem(
            "loggedInUser",
            JSON.stringify({
              ...existing,
              token: newToken,
            })
          );

          const targetUrl =
            location.toLowerCase() === "alwar"
              ? ""
              : import.meta.env.VITE_REACT_APP_SWITCH_URL;

          const urlParams = new URLSearchParams();
          if (previousToken) {
            urlParams.append("previousToken", previousToken);
          }

          const redirectUrl = `${targetUrl}?${urlParams.toString()}`;
          localStorage.removeItem("otherData");
          localStorage.removeItem("loggedInUser");
          window.location.replace(redirectUrl);
        }, 1500);
      } else {
        setIsSwitchingModule(false);
        setSwitchingLocation(null);
        toast.error(responseMessage || "Failed to switch module");
      }
    } catch (error) {
      setIsSwitchingModule(false);
      setSwitchingLocation(null);
      const errorMessage =
        error?.message ||
        error?.response?.message ||
        "An error occurred while switching module";
      toast.error(errorMessage);
    }
  };

  const path = window.location.hostname;
  const isTestServer =
    path.includes("dev.mscorpres") || path.includes("localhost");

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
      {showBlackScreen && (
        <TopBanner
          messages={[
            "Welcome to IMS Alwar.",
            "System maintenance scheduled for 7th December Sunday 01 AM - 23 PM",
          ]}
          onVisibilityChange={setIsBannerVisible}
        />
      )}
      <Layout
        style={{
          width: "100%",
          top: 0,
          paddingTop: isBannerVisible ? "30px" : "0px",
        }}
      >
        {/* header start */}

        {isTestServer && (
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
                    title={null}
                    open={showSwitchModule}
                    onCancel={() => {
                      if (!isSwitchingModule) {
                        setShowSwitchModule(false);
                        setSwitchLocation(null);
                        setSwitchBranch(null);
                        setSwitchSession(null);
                        setIsSwitchingModule(false);
                        setSwitchingLocation(null);
                        setSwitchSuccess(false);
                      }
                    }}
                    footer={null}
                    width={400}
                    centered
                    maskClosable={!isSwitchingModule}
                    closable={!isSwitchingModule}
                  >
                    {isSwitchingModule ? (
                      <div
                        style={{
                          padding: "60px 0",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {switchSuccess ? (
                          <>
                            <video
                              src="/assets/check.mp4"
                              autoPlay
                              muted
                              style={{ width: 120, height: 120 }}
                            />
                            <p
                              style={{
                                marginTop: 16,
                                color: customColor.newBgColor,
                                fontWeight: 500,
                              }}
                            >
                              Authenticated! Redirecting...
                            </p>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                border: "4px solid #f3f3f3",
                                borderTop: "4px solid #047780",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                              }}
                            />
                            <style>
                              {`
                                @keyframes spin {
                                  0% { transform: rotate(0deg); }
                                  100% { transform: rotate(360deg); }
                                }
                              `}
                            </style>
                            <p style={{ marginTop: 16, color: "#666" }}>
                              Authenticating...
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "20px 0",
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                          }}
                        >
                          <SwapOutlined
                            style={{
                              fontSize: 28,
                              color: customColor.newBgColor,
                            }}
                          />
                        </div>
                        <h3 style={{ margin: "0 0 24px 0", color: "#333" }}>
                          Switch Module
                        </h3>
                        <div style={{ width: "100%", maxWidth: 300 }}>
                          <div style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                fontWeight: 500,
                                color: "#666",
                              }}
                            >
                              Location
                            </div>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select Location"
                              options={[
                                { label: "Alwar", value: "alwar" },
                                { label: "Noida", value: "noida" },
                              ]}
                              value={switchLocation}
                              onChange={(value) => {
                                setSwitchLocation(value);
                                setSwitchBranch(null);
                              }}
                            />
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                fontWeight: 500,
                                color: "#666",
                              }}
                            >
                              Branch
                            </div>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select Branch"
                              disabled={!switchLocation}
                              options={
                                switchLocation
                                  ? locationBranchOptions[switchLocation]
                                  : []
                              }
                              value={switchBranch}
                              onChange={(value) => setSwitchBranch(value)}
                            />
                          </div>
                          <div style={{ marginBottom: 24 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                fontWeight: 500,
                                color: "#666",
                              }}
                            >
                              Session
                            </div>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select Session"
                              options={sessionOptions}
                              value={switchSession || user?.session}
                              onChange={(value) => setSwitchSession(value)}
                            />
                          </div>
                          <Button
                            type="primary"
                            block
                            size="large"
                            style={{
                              background: customColor.newBgColor,
                              borderColor: customColor.newBgColor,
                              height: 44,
                            }}
                            disabled={!switchLocation || !switchBranch}
                            onClick={() => {
                              handleSwitchModule(
                                switchLocation.charAt(0).toUpperCase() +
                                  switchLocation.slice(1),
                                switchBranch,
                                switchSession || user?.session
                              );
                            }}
                          >
                            Authenticate
                          </Button>
                        </div>
                      </div>
                    )}
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
                  height: (() => {
                    const headerHeight = 50;
                    const bannerHeight = isBannerVisible ? 40 : 0;
                    const testServerHeight = isTestServer ? 15 : 0;
                    return `calc(100vh - ${headerHeight}px - ${bannerHeight}px - ${testServerHeight}px)`;
                  })(),
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

import React, { useState, useEffect, useRef } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";
import Sidebar from "./new/Sidebar/Sidebar.jsx";
import Rout from "./Routes/Routes";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "buffer";
import AppHeader from "./new/Header/AppHeader.jsx";
import NotificationDropdown from "./Components/NotificationDropdown/NotificationDropdown";
import {
  logout,
  setNotifications,
  setTestPages,
  setCompanyBranch,
  setCurrentLink,
  setSession,
  setUser,
  setSettings,
} from "./Features/loginSlice/loginSlice.js";
import UserMenu from "./Components/UserMenu";
import Logo from "./Components/Logo";
import socket from "./Components/socket.js";
import {
  toggleNotifications,
  setShowNotifications,
  setShowMessageNotifications,
  setShowTickets,
  setShowSetting,
  setShowSwitchModule,
} from "./Features/uiSlice/uiSlice.js";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Select, Modal, Button } from "antd";
import { SearchOutlined, SwapOutlined } from "@ant-design/icons";
import { Tooltip, IconButton } from "@mui/material";
import { SiSocketdotio } from "react-icons/si";
import InternalNav from "./Components/InternalNav";
import { imsAxios } from "./axiosInterceptor";
import internalLinks from "./Pages/internalLinks.jsx";
import TicketsModal from "./Components/TicketsModal/TicketsModal";
import { items, items1 } from "./utils/sidebarRoutes.jsx";
import TopBanner from "./Components/TopBanner";
import SettingDrawer from "./Components/SettingDrawer.jsx";
import { customColor } from "./utils/customColor.js";
import Information from "./Pages/Master/Components/Information.jsx";

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const sessionFromUrl = searchParams.get("session");
  const branchFromUrl = searchParams.get("branch");
  const comFromUrl = searchParams.get("company");
  const { user, notifications, testPages } = useSelector(
    (state) => state.login
  );

  const {
    showNotifications,

    showMessageNotifications,

    showTickets,

    showSetting,

    showSwitchModule,
  } = useSelector((state) => state.ui);

  const filteredRoutes = Rout.filter((route) => {
    return !route.dept || user?.showlegal;
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSideBar, setShowSideBar] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const { pathname } = useLocation();
  const [testPage, setTestPage] = useState(false);
  const [branchSelected, setBranchSelected] = useState(true);
  const [modulesOptions, setModulesOptions] = useState([]);
  const [searchModule, setSearchModule] = useState("");
  const [showHisList, setShowHisList] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const notificationsRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingModule, setIsSwitchingModule] = useState(false);
  const [switchLocation, setSwitchLocation] = useState(null);
  const [switchBranch, setSwitchBranch] = useState(null);
  const [switchSession, setSwitchSession] = useState(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [searchHis, setSearchHis] = useState("");
  const [hisList, setHisList] = useState([]);
  const logoutHandler = () => {
    setShowBlackScreen(false);
    dispatch(logout());
  };
  const deleteNotification = (id) => {
    let arr = notifications;
    arr = arr.filter((not) => not.ID != id);
    dispatch(setNotifications(arr));
  };

  const handleSelectCompanyBranch = (value) => {
    dispatch(setCompanyBranch(value));
    setBranchSelected(true);
    socket.emit("getBranch", value);
  };
  const handleSelectSession = (value) => {
    dispatch(setSession(value));
  };

  // Function to get all modules
  const getAllModules = () => {
    let arr = [];
    let allModOpt = [];
    internalLinks.map((row) => {
      let a = row;
      arr.push(...a);
    });
    arr.map((row) => {
      if (row && row.routeName) {
        let obj = {
          label: row.routeName,
          value: row.routePath,
        };
        allModOpt.push(obj);
      }
    });
    return allModOpt;
  };

  // Load all modules on component mount
  useEffect(() => {
    const allMods = getAllModules();
    setAllModules(allMods);
    // Show all modules by default
    setModulesOptions(allMods);
  }, []);

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
  // Removed useEffect that was interfering with search results
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

  const fetchUserDeatils = async (token, session, com, branch) => {
    setLoadingSwitch(true);
    localStorage.removeItem("loggedInUser");

    try {
      const response = await imsAxios.get(
        `/auth/switch?next=alwar.mscorpres.com&company=${com}&token=${token}&session=${session}&branch=${branch}`
      );
      if (response?.success) {
        const payload = response?.data;
        const obj = {
          email: payload.crn_email,
          phone: payload.crn_mobile,
          comId: payload.company_id,
          userName: payload.username,
          token: payload.token,
          favPages: payload.fav_pages ? JSON.parse(payload.fav_pages) : [],
          type: payload.crn_type,
          mobileConfirmed: payload.other?.m_v,
          emailConfirmed: payload.other?.e_v,
          passwordChanged: payload.other?.c_p ?? "C",
          company_branch: branch, // Use selected branch from login form
          currentLink: JSON.parse(localStorage.getItem("branchData"))
            ?.currentLink,
          id: payload.crn_id,
          showlegal: payload.department === "legal" ? true : false,
          session: session,
        };
        localStorage.setItem("loggedInUser", JSON.stringify(obj));
        dispatch(setUser(obj));
        if (payload.settings) dispatch(setSettings(payload.settings));
        setLoadingSwitch(false);
        setSearchParams({}, { replace: true });
      } else {
        setLoadingSwitch(false);
        toast.error(response?.message);
        window.location.replace("https://oakter.mscorpres.com/");
      }
    } catch (error) {
      setLoadingSwitch(false);
      toast.error(response?.message);
      window.location.replace("https://oakter.mscorpres.com/");
    }
  };

  useEffect(() => {
    if (tokenFromUrl && sessionFromUrl && comFromUrl && branchFromUrl) {
      fetchUserDeatils(tokenFromUrl, sessionFromUrl, comFromUrl, branchFromUrl);
    }
  }, [tokenFromUrl, sessionFromUrl, comFromUrl, branchFromUrl]);

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
        localStorage.getItem("branchData")
      )?.company_branch;
      if (branch) {
        setBranchSelected(true);
      }
      // handleSelectSession("23-24");
    }
  }, [user]);
  useEffect(() => {
    if (pathname === "/login" && user) {
      const link = JSON.parse(localStorage.getItem("branchData"))?.currentLink;
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
        dispatch(setShowNotifications(false));
      }
    }
  }, [showMessageNotifications, dispatch]);

  useEffect(() => {
    if (showNotifications) {
      {
        dispatch(setShowMessageNotifications(false));
      }
    }
  }, [showNotifications, dispatch]);

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
    } else {
      // Reset black screen when user logs out or passwordChanged is not "C"
      setShowBlackScreen(false);
    }
  }, [user]);

  useEffect(() => {
    setModulesOptions([]);

    if (searchModule.length > 2) {
      let searching = searchHis.filter((i) => i.value === searchModule);

      setHisList([...hisList, searching]);

      let a = hisList.push(...hisList, ...searching);

      const ids = hisList.map(({ label, text }) => label || text); // Support both formats

      const filtered = hisList.filter(
        ({ label, text }, index) => !ids.includes(label || text, index + 1)
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
    const existing = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    const previousToken = existing?.token;

    const company = location.toLowerCase() === "alwar" ? "COM0002" : "COM0001";
    if (company === existing?.comId) {
      toast.error(`You are already On ${location} Module`);
      return;
    }

    const targetUrl = import.meta.env.VITE_REACT_APP_SWITCH_URL;

    const urlParams = new URLSearchParams();
    if (previousToken && location && branch && session) {
      urlParams.append("token", previousToken);
      urlParams.append("company", company);
      urlParams.append("branch", branch);
      urlParams.append("session", session);
    }

    const redirectUrl = `${targetUrl}?${urlParams.toString()}`;
    window.location.replace(redirectUrl);
  };

  const path = window.location.hostname;
  const isTestServer =
    path.includes("dev.mscorpres") || path.includes("localhost");

  const refreshConnection = () => {
    setIsLoading(true);
    socket.close();
    socket.open();
  };

  if (loadingSwitch) {
    return (
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <LinearProgress
          sx={{
            position: "sticky",
            top: 0,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/assets/images/mscorpres_auto_logo.png"
            alt=""
            style={{ width: 100, opacity: 0.8 }}
          />
        </Box>
      </Box>
    );
  }

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
        <Information />
        {user && user.passwordChanged === "C" && (
          <Layout style={{ height: "100%" }}>
            <AppHeader
              onToggleSidebar={() => setShowSideBar((open) => !open)}
              logo={<Logo />}
              title="IMS"
              branchOptions={options}
              sessionOptions={sessionOptions}
              branchValue={user.company_branch}
              sessionValue={user.session}
              onChangeBranch={(value) => handleSelectCompanyBranch(value)}
              onChangeSession={(value) => handleSelectSession(value)}
              showSearch
              searchComponent={
                <Select
                  showSearch
                  placeholder="Search..."
                  value={searchModule || undefined}
                  onChange={(value) => {
                    setSearchModule(value);
                    navigate(value);
                  }}
                  onSearch={(value) => {
                    if (value && value.trim().length > 0) {
                      getModuleSearchOptions(value.toLowerCase());
                    } else {
                      // Show all modules when search is cleared
                      setModulesOptions(
                        allModules.length > 0 ? allModules : []
                      );
                    }
                  }}
                  options={
                    modulesOptions?.length > 0
                      ? modulesOptions
                      : allModules.length > 0
                      ? allModules
                      : showHisList || []
                  }
                  filterOption={false}
                  notFoundContent={null}
                  style={{
                    width: 200,
                  }}
                  className="header-search-select"
                  suffixIcon={
                    <SearchOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
                  }
                  onFocus={() => {
                    // Show all modules when focused if no search is active
                    if (!searchModule && allModules.length > 0) {
                      setModulesOptions(allModules);
                    }
                    // Load search history if available
                    if (showHisList.length === 0) {
                      showRecentSearch();
                    }
                  }}
                />
              }
              socketConnected={isConnected}
              socketLoading={isLoading}
              onRefreshSocket={() => refreshConnection()}
              notificationsCount={
                notifications.filter((not) => not?.type != "message")?.length
              }
              onClickNotifications={() => dispatch(toggleNotifications())}
              messagesCount={
                notifications.filter((not) => not?.type == "message").length
              }
              onClickMessages={() => dispatch(setShowTickets(true))}
              switchModule={
                <Tooltip title="Switch Module" placement="bottom">
                  <SwapOutlined
                    style={{
                      fontSize: 18,
                      color: "white",
                      cursor: "pointer",
                    }}
                    onClick={() => dispatch(setShowSwitchModule(true))}
                  />
                </Tooltip>
              }
              userMenu={
                <UserMenu
                  user={user}
                  logoutHandler={logoutHandler}
                  setShowSettings={(value) => dispatch(setShowSetting(value))}
                />
              }
              extraRight={
                showSetting ? (
                  <SettingDrawer
                    open={showSetting}
                    hide={() => dispatch(setShowSetting(false))}
                  />
                ) : null
              }
            />
            <NotificationDropdown
              open={showNotifications}
              onClose={() => dispatch(setShowNotifications(false))}
              notifications={notifications.filter(
                (not) => not?.type != "message"
              )}
              deleteNotification={deleteNotification}
            
            />
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
          <div
            style={{
              display: "flex",
              height: "100%",
              paddingTop: user && user.passwordChanged === "C" ? 45 : 0,
            }}
          >
            <TicketsModal
              open={showTickets}
              handleClose={() => dispatch(setShowTickets(false))}
            />
            {user && user.passwordChanged === "C" && (
              <>
                <Sidebar
                  className="site-layout-background"
                  key={1}
                  setShowSideBar={setShowSideBar}
                  showSideBar={showSideBar}
                  useJsonConfig={true}
                  topOffset={isTestServer || isBannerVisible ? 90 : 45}
                  onWidthChange={(w) => {
                    const layout = document.querySelector(
                      "#app-content-left-margin"
                    );
                    if (layout) layout.style.marginLeft = `${w}px`;
                  }}
                />
              </>
            )}
            {/* sidebar ends */}
            <Layout
              onClick={(e) => {
                // Don't close if clicking on notification button

                const target = e.target;

                if (notificationButtonRef.current?.contains(target)) {
                  return;
                }

                dispatch(setShowNotifications(false));

                dispatch(setShowMessageNotifications(false));
              }}
              id="app-content-left-margin"
              style={{
                height: "100%",

                marginLeft:
                  user && user.passwordChanged === "C"
                    ? showSideBar
                      ? 230
                      : 56
                    : 0,

                minWidth: 0,
              }}
            >
              <Content style={{ height: "100%" }}>
                <InternalNav links={internalLinks} />

                <div
                  style={{
                    height: (() => {
                      const headerHeight = 50;
                      const bannerHeight = isBannerVisible ? 40 : 0;
                      const testServerHeight = isTestServer ? 15 : 0;
                      const byDefaultHeight = pathname === "/myProfile" ? 0 : 55;
                      return `calc(100vh - ${headerHeight}px - ${bannerHeight}px - ${testServerHeight}px - ${byDefaultHeight}px)  `;
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
          </div>
        </Layout>
      </Layout>

      <Modal
        title={null}
        open={showSwitchModule}
        onCancel={() => {
          if (!isSwitchingModule) {
            dispatch(setShowSwitchModule(false));
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
                    color: "#047780",
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
              <SwapOutlined style={{ fontSize: 28, color: "#047780" }} />
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
                    switchLocation ? locationBranchOptions[switchLocation] : []
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
                  background: "#047780",
                  borderColor: "#047780",
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
                Switch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;

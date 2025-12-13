import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css/effect-fade";
import { Typography as MuiTypography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Form,
  Modal,
  Row,
Typography,
  Col,
  Card,
  Input,
  Button,
  Flex,
  Alert,
} from "antd";
import { imsAxios } from "../../axiosInterceptor";
import useApi from "../../hooks/useApi.ts";
import { setSettings, setUser } from "../../Features/loginSlice/loginSlice";
import ReCAPTCHA from "react-google-recaptcha";
import {
  ArrowLeftOutlined,
  SafetyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import SelectEndPoint from "../SelectEndPoint";

const Login = () => {
  document.title = "IMS Login";
  const [signUpPage, setSignUpPage] = useState("1");
  const [forgotPassword, setForgotPassword] = useState("0");
  const [recaptchaValue, setRecaptchaValue] = React.useState(null);
  const [ispassSame, setIsPassSame] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recaptchaKey, setRecaptchaKey] = React.useState(Math.random());
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [userCredentials, setUserCredentials] = useState(null);
  const [showCustomUrlModal, setShowCustomUrlModal] = useState(false);
  const { executeFun, loading } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inpVal, setInpVal] = useState({
    username: "",
    password: "",
    company_branch: "BRALWR36",
  });
  const { Title, Link, Text } = Typography;
  const [signUp] = Form.useForm();
  const inputHandler = (name, value) => {
    setInpVal(() => {
      return {
        ...inpVal,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    // if (!recaptchaValue) {
    //   toast.error("Please verify the reCAPTCHA");
    //   return;
    // }
    const { username, password } = inpVal;
    if (username === "" && password === "") {
      toast.error("Please fill the field");
    } else if (username === "") {
      toast.error("username Field is Empty");
    } else if (password === "") {
      toast.error("password fill is empty");
    } else {
      const res = await executeFun(
        () =>
          imsAxios.post("/auth/signin", {
            username: username,
            password: password,
          }),
        "submit"
      );
      const { success } = res || {};

      if (success) {
        const isTwoStep = res?.isTwoStep ?? res?.data?.isTwoStep;
        if (isTwoStep === "Y") {
          // Two-step login, show OTP screen
          setUserCredentials({
            username,
            token: res?.token,
            qrCode: res?.qrCode,
            company_branch: inpVal.company_branch, // Store selected branch for OTP flow
          });
          setShowOTP(true);
          setOtpTimer(600); // Reset timer to 10 minutes
          toast.success("OTP sent to your registered email address");
        } else {
          // Normal login flow (no OTP)
          const payload = res?.data ?? res;
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
            company_branch: inpVal.company_branch, // Use selected branch from login form
            currentLink: JSON.parse(localStorage.getItem("branchData"))
              ?.currentLink,
            id: payload.crn_id,
            showlegal: payload.department === "legal" ? true : false,
            session: "25-26",
          };
          dispatch(setUser(obj));
          if (payload.settings) dispatch(setSettings(payload.settings));
          toast.success("Login successful!");
          navigate("/");
        }
      } else {
        setRecaptchaValue(null);
        setRecaptchaKey(Math.random());
        toast.error(res?.message);
      }
      // dispatch(
      //   loginAuth({ username: inpVal.username, password: inpVal.password })
      // );
    }
  };
  const validatecreateNewUser = async () => {
    if (!recaptchaValue) {
      toast.error("Please verify the reCAPTCHA");
      return;
    }
    const values = await signUp.validateFields();
    console.log("values", values);
    // createNewUser(values);
    askModalConfirm(values);
  };
  const askModalConfirm = (values) => {
    console.log("values.username", values.username);
    Modal.confirm({
      title: `Are you sure you want to create this new user?`,
      content: (
        <>
          <Typography>
            You requested for creating account. Please make sure that the values
            are correct.
          </Typography>
          <Row style={{ marginTop: "1em" }}>
            <Text>
              {" "}
              Email Id -<Text strong>{values.username}</Text>
            </Text>
          </Row>
          <Row>
            <Text>
              {" "}
              Number -<Text strong>{values.number}</Text>
            </Text>
          </Row>
        </>
      ),

      onOk() {
        createNewUser(values);
      },
      onCancel() {
        // submitUnVerifyHandler(row);
      },
      okText: "Yes",
      cancelText: "No",
    });
  };
  const createNewUser = async (values) => {
    const response = await imsAxios.post("/auth/singup/new", {
      username: values.name,
      email: values.username,
      mobile: values.number,
      password: values.password2,
    });

    if (response.success) {
      toast.success(response.message);
      setSignUpPage("1");
      signUp.resetFields();
    } else {
      toast.error(response.message?.msg || response.message);
    }
  };
  // useEffect(() => {
  //   if (message?.length > 0) {
  //     if (user) {
  //       navigate("/r1");
  //       // toast.success(message);
  //     }
  //   }
  // }, [message, user]);
  // useEffect(() => {
  //   if (user) {
  //     navigate("/");
  //   }
  // }, []);
  const setThePassword = async () => {
    const values = await signUp.validateFields();
    // console.log("values", values);
    // return;
    let response = await imsAxios.post("/auth/forgot_password", {
      username: values.username,
      new_password: values.confirmPassword,
    });
    // console.log("response", response);
    const { data } = response;
    if (response.success) {
      // console.log("data.message", response.message);
      toast.success(response.message);
    }
  };
  const back = () => {
    setSignUpPage("1");
    setForgotPassword("0");
  };
  const createAcc = () => {
    setSignUpPage("2");
    setForgotPassword("0");
  };
  const isPasswordSame = () => {
    if (
      signUp.getFieldValue("confirmPassword") ===
      signUp.getFieldValue("password")
    ) {
      // console.log("same");
      setIsPassSame(true);
    } else {
      setIsPassSame(false);
    }
  };
  useEffect(() => {
    isPasswordSame();
  }, [
    signUp.getFieldValue("confirmPassword"),
    signUp.getFieldValue("password"),
  ]);

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  // OTP Timer Effect
  useEffect(() => {
    let interval = null;
    if (showOTP && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      toast.error("OTP has expired. Please login again.");
      setShowOTP(false);
      setOtpCode(["", "", "", "", "", ""]);
    }
    return () => clearInterval(interval);
  }, [showOTP, otpTimer]);

  // OTP Input Handler
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // OTP Backspace Handler
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = otpCode.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    if (!userCredentials?.token) {
      toast.error("Session expired. Please login again.");
      backToLogin();
      return;
    }

    try {
      const res = await executeFun(
        () =>
          imsAxios.post(
            "/auth/verify",
            { otp: otpString },
            {
              headers: {
                "x-csrf-token": userCredentials.token,
                Authorization: `${userCredentials.token}`,
              },
            }
          ),
        "verifyOtp"
      );

      // debugger
      if (res?.success) {
        const payload = res?.data ?? res;
        const obj = {
          email: payload.crn_email,
          phone: payload.crn_mobile,
          userName: payload.username,
          comId: payload.company_id,
          token: payload.token,
          favPages: payload.fav_pages ? JSON.parse(payload.fav_pages) : [],
          type: payload.crn_type,
          mobileConfirmed: payload.other?.m_v,
          emailConfirmed: payload.other?.e_v,
          passwordChanged: payload.other?.c_p ?? "C",
          company_branch: userCredentials.company_branch, // Use stored branch from login
          currentLink: JSON.parse(localStorage.getItem("branchData"))
            ?.currentLink,
          id: payload.crn_id,
          showlegal: payload.department === "legal" ? true : false,
          session: "25-26",
        };
        dispatch(setUser(obj));
        if (payload.settings) dispatch(setSettings(payload.settings));
        toast.success("Login successful!");
        navigate("/");
        window.location.reload();
      } else {
        toast.error(res?.message || "Invalid OTP. Please try again.");
        setOtpCode(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      setOtpCode(["", "", "", "", "", ""]);
    }
  };

  // Back to login
  const backToLogin = () => {
    setShowOTP(false);
    setOtpCode(["", "", "", "", "", ""]);
    setOtpTimer(600);
    setUserCredentials(null);
  };

  // Format timer display
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // console.log("ispassSame", ispassSame);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        gap:20
      }}
    >
      <div className="w-full h-full bg-neutral-100" style={{ height: "100vh", overflow: "hidden" }}>
        <Swiper
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect={"fade"}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination, EffectFade, Autoplay]}
          className="mySwiper"
          style={{ height: "100vh", position: "relative" }}
        >
          <SwiperSlide className="h-full">
            <div style={{ height: "100%", width: "100%", position: "relative", backgroundColor: "#f5f5f5" }}>
              <div className="h-[50vh] bg-[url(/assets/images/loginv2bg2.svg)] bg-cover bg-center flex items-center justify-center" style={{ position: "relative", zIndex: 1 }}>
                <MuiTypography
                  variant="h1"
                  fontSize={50}
                  fontWeight={500}
                  className="text-white"
                >
                  Welcome to the Future of ERP
                </MuiTypography>
              </div>
              <div className="h-[50vh] py-[20px] px-[50px] bg-neutral-100" style={{ overflow: "hidden", position: "relative", zIndex: 1, backgroundColor: "#f5f5f5" }}>
                <MuiTypography
                  variant="h2"
                  fontSize={25}
                  fontWeight={500}
                  className="text-stone-700"
                >
                  Revolutionizing Business Operations
                </MuiTypography>
                <MuiTypography
                  variant="h3"
                  fontSize={17}
                  fontWeight={500}
                  className="text-stone-700"
                >
                  Scalable, secure, and tailored to grow with your business.
                </MuiTypography>
                <ul className="flex flex-col gap-[15px] mt-[20px] ml-2 h-[calc(50vh-120px)] overflow-y-auto">
                  {[
                    "Scalable design to meet the demands of growing businesses.",
                    "Instant alerts for stock updates and sales activities",
                    "Multi-location tracking for global operations.",
                    "Seamless integration with accounting, CRM, and e-commerce.",
                    "Regular updates to keep the system future-proof.",
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-[10px]">
                      <DoneAllIcon color="primary" />
                      <MuiTypography fontSize={15}>{text}</MuiTypography>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="h-full">
            <div style={{ height: "100%", width: "100%", position: "relative", backgroundColor: "#f5f5f5" }}>
              <div className="h-[50vh] bg-[url(/assets/images/loginv2bg2.svg)] bg-cover bg-center flex items-center justify-center" style={{ position: "relative", zIndex: 1 }}>
                <MuiTypography
                  variant="h1"
                  fontSize={50}
                  fontWeight={500}
                  className="text-white"
                >
                  Powering Smarter Operations
                </MuiTypography>
              </div>
              <div className="h-[50vh] py-[20px] px-[50px] bg-neutral-100" style={{ overflow: "hidden", position: "relative", zIndex: 1, backgroundColor: "#f5f5f5" }}>
                <MuiTypography
                  variant="h2"
                  fontSize={25}
                  fontWeight={500}
                  className="text-stone-700"
                >
                  Effortless Inventory Management
                </MuiTypography>
                <MuiTypography
                  variant="h3"
                  fontSize={17}
                  fontWeight={500}
                  className="text-stone-700"
                >
                  Track, manage, and optimize your inventory with ease.
                </MuiTypography>
                <ul className="flex flex-col gap-[15px] mt-[20px] ml-2 h-[calc(50vh-120px)] overflow-y-auto">
                  {[
                    "Real-Time Inventory Updates: Stay informed with real-time stock tracking and updates.",
                    "Streamlined Operations: Manage purchases, sales, and stock transfers seamlessly.",
                    "User-Friendly Dashboard: Access all essential features through an intuitive and responsive interface.",
                    "Multi-User Access: Enable team collaboration with role-based permissions.",
                    "Secure Data Management: Ensure the safety of your data with robust security protocols.",
                  ].map((text, index) => (
                    <li key={index} className="flex items-start gap-[10px]">
                      <DoneAllIcon color="primary" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <MuiTypography fontSize={15} style={{ wordBreak: "break-word" }}>{text}</MuiTypography>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="flex justify-center items-center">
        <Row
          justify="center"
          style={{ width: "100%", maxWidth: "600px" }}
          align="middle"
          gutter={[5, 5]}
        >
          <Col span={24}>
            {showOTP ? (
              <Card
                style={{
                  height: 500,
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                {/* <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setShowCustomUrlModal(true)}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 10,
                    }}
                    title="Add Custom URL"
                  /> */}
                <Title
                  style={{
                    color: "#04b0a8",
                    textAlign: "center",
                    marginBottom: 20,
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                  level={3}
                >
                  Two-Factor Authentication
                </Title>

                <Text
                  style={{
                    textAlign: "center",
                    display: "block",
                    marginBottom: 30,
                    color: "#666",
                    fontSize: 14,
                  }}
                >
                  Enter the 6-digit verification code sent to your registered
                  Email address (expires in 5 minutes)
                </Text>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {otpCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-input-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength={1}
                      style={{
                        width: 50,
                        height: 50,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: "bold",
                        border: digit
                          ? "2px solid #04b0a8"
                          : "1px solid #d9d9d9",
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </div>

                <Text
                  style={{
                    textAlign: "center",
                    display: "block",
                    marginBottom: 30,
                    color: "#666",
                    fontSize: 14,
                  }}
                >
                  Code expires in {formatTimer(otpTimer)}
                </Text>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={verifyOTP}
                  loading={loading("verifyOtp")}
                  style={{
                    height: 45,
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 20,
                    backgroundColor: "#04b0a8",
                    borderColor: "#04b0a8",
                  }}
                >
                  Verify & Continue
                </Button>

                <div style={{ textAlign: "center" }}>
                  <Button
                    type="link"
                    onClick={backToLogin}
                    style={{ color: "#666" }}
                  >
                    <ArrowLeftOutlined /> Back to Sign In
                  </Button>
                </div>

                <Alert
                  message="For your security, this code will expire in 5 minutes. Never share this code with anyone."
                  type="info"
                  showIcon
                  icon={<SafetyOutlined />}
                  style={{
                    marginTop: 20,
                    backgroundColor: "#e6f7ff",
                    borderColor: "#91d5ff",
                    borderRadius: 8,
                  }}
                />
              </Card>
            ) : signUpPage === "1" ? (
              <Card style={{ height: 450, position: "relative" }}>
                {/* <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setShowCustomUrlModal(true)}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 10,
                    }}
                    title="Add Custom URL"
                  /> */}
                <Title
                  style={{
                    color: "gray",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                  level={4}
                >
                  Secure Login To IMS
                </Title>
                <Form
                  name="basic"
                  layout="vertical"
                  onFinish={handleSubmit}
                  autoComplete="off"
                  form={signUp}
                >
                  {/* <Form.Item label="Company Branch" name="company_branch">
                      <Select
                        value={inpVal.company_branch}
                        onChange={(v) => inputHandler("company_branch", v)}
                        options={[
                          { label: "A-21 [BRMSC012]", value: "BRMSC012" },
                          { label: "B-29 [BRMSC029]", value: "BRMSC029" },
                          { label: "B-36 Alwar [BRBA036]", value: "BRBA036" },
                          { label: "D-160 [BRBAD116]", value: "BRBAD116" },
                        ]}
                        size="medium"
                      />
                    </Form.Item> */}
                  <Form.Item
                    label="Username / Mobile / CRN Number"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please provide either your email or phone number or CRN Nunber",
                      },
                    ]}
                  >
                    <Input
                      value={inpVal.username}
                      onChange={(e) => inputHandler("username", e.target.value)}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      value={inpVal.password}
                      onChange={(e) => inputHandler("password", e.target.value)}
                      size="large"
                    />
                  </Form.Item>

                  {forgotPassword === "0" ? (
                    <>
                      {/* <Form.Item
                          label="Password"
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: "Please input your password!",
                            },
                          ]}
                        >
                          <Input.Password
                            value={inpVal.password}
                            onChange={(e) =>
                              inputHandler("password", e.target.value)
                            }
                            size="large"
                          />
                        </Form.Item> */}
                      {/* <Link onClick={() => setForgotPassword("1")}>
                          Forgot Password
                        </Link> */}
                      <div className="flex justify-center">
                        <ReCAPTCHA
                          sitekey="6LdmVcArAAAAAOb1vljqG4DTEEi2zP1TIjDd_0wR"
                          onChange={handleRecaptchaChange}
                          key={recaptchaKey}
                        />
                      </div>
                      <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <Button
                          loading={loading("submit")}
                          block
                          size="large"
                          type="primary"
                          htmlType="submit"
                          style={{ marginTop: "1em" }}
                        >
                          Log In
                        </Button>
                      </Form.Item>
                      <Flex justify="end">
                        <Button
                          onClick={() => setShowForgotPassword(true)}
                          type="link"
                        >
                          Forgot Password
                        </Button>
                      </Flex>
                      <Text style={{ marginLeft: "8em" }}>
                        {" "}
                        Not Registered yet?
                      </Text>
                      <Link style={{ marginLeft: "1em" }} onClick={createAcc}>
                        Create an Account
                      </Link>
                      <br />
                    </>
                  ) : (
                    <>
                      <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[
                          {
                            required: true,
                            message: "Please input your password!",
                          },
                        ]}
                      >
                        <Input.Password
                          value={inpVal.password}
                          onChange={(e) =>
                            inputHandler("password", e.target.value)
                          }
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <Button
                          // loading={loading}
                          block
                          size="large"
                          type="primary"
                          htmlType="submit"
                          style={{ marginTop: "1em" }}
                          disabled={!ispassSame}
                          onClick={setThePassword}
                        >
                          Reset Password
                        </Button>
                      </Form.Item>

                      <Link style={{ marginLeft: "8em" }} onClick={back}>
                        Back to Log In
                      </Link>
                      <Link
                        style={{ marginLeft: "1em" }}
                        onClick={() => setSignUpPage("2")}
                      >
                        Create an Account
                      </Link>
                    </>
                  )}
                </Form>
              </Card>
            ) : (
              <Card style={{ height: 600, position: "relative" }}>
                {/* <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setShowCustomUrlModal(true)}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 10,
                    }}
                    title="Add Custom URL"
                  /> */}
                <Title
                  style={{
                    color: "gray",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                  level={4}
                >
                  Register To IMS
                </Title>
                <Form
                  name="basic"
                  layout="vertical"
                  onFinish={handleSubmit}
                  autoComplete="off"
                  form={signUp}
                >
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please provide your name",
                      },
                    ]}
                  >
                    <Input
                      value={inpVal.name}
                      onChange={(e) => inputHandler("name", e.target.value)}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Mobile Number"
                    name="number"
                    rules={[
                      {
                        required: true,
                        message: "Please provide phone number.",
                      },
                    ]}
                  >
                    <Input
                      value={inpVal.number}
                      onChange={(e) => inputHandler("number", e.target.value)}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Email Address"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please provide either your email or phone number or CRN Nunber",
                      },
                    ]}
                  >
                    <Input
                      value={inpVal.username}
                      onChange={(e) => inputHandler("username", e.target.value)}
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  {/* Field */}
                  <Form.Item
                    label="Confirm Password"
                    name="password2"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              "The new password that you entered do not match!"
                            )
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Form>
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey="6LdmVcArAAAAAOb1vljqG4DTEEi2zP1TIjDd_0wR"
                    onChange={handleRecaptchaChange}
                    key={recaptchaKey}
                  />
                </div>
                <Button
                  // loading={loading}
                  block
                  size="large"
                  type="primary"
                  htmlType="submit"
                  style={{ marginTop: "2em" }}
                  onClick={() => validatecreateNewUser()}
                >
                  Sign Up
                </Button>
                <Row justify="center" style={{ marginTop: "1em" }}>
                  <Link style={{ marginLeft: "1em" }} onClick={back}>
                    Back to Log In
                  </Link>
                </Row>
              </Card>
            )}
          </Col>
        </Row>
      </div>
      <Modal
        title="Add Custom URL"
        open={showCustomUrlModal}
        onCancel={() => setShowCustomUrlModal(false)}
        footer={null}
        width={600}
      >
        <SelectEndPoint />
      </Modal>
    </div>
  );
};

export default Login;

// <div style={{ height: "" }}>
//     <ForgotPassword
//       show={showForgotPassword}
//       hide={() => setShowForgotPassword(false)}
//     />
//     <Row style={{ height: "100%" }}>
//       <Col
//         span={8}
//         style={{
//           height: "100%",
//           width: "100%",
//         }}
//       >
//         <div
//           style={{
//             height: "calc(100vh - 164px)",
//             width: "100%",
//             backgroundRepeat: "no-repeat",
//             backgroundSize: "cover",
//             backgroundPosition: "-600px 00px",
//             backgroundColor: "#ecf4fc !important",
//             backgroundImage:
//               "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9Im5vbmUiPg0KDQogICA8Y2lyY2xlIHI9IjU3MCIgY3k9IjEwMDAiIGN4PSIxNDAwIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9InBhbGV2aW9sZXRyZWQiIG9wYWNpdHk9IjAuMDciIC8+DQogICANCiAgIDxjaXJjbGUgcj0iMTIiIGN5PSI4MDAiIGN4PSI2OTAiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNDUiIHN0cm9rZT0icHVycGxlIiBzdHJva2Utd2lkdGg9IjciIC8+DQogICA8Y2lyY2xlIHI9IjEyIiBjeT0iNjYwIiBjeD0iODAwIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjciIHN0cm9rZT0iIzRCN0RBMCIgc3Ryb2tlLXdpZHRoPSI3IiAvPg0KICAgPGNpcmNsZSByPSIxNiIgY3k9IjY1MCIgY3g9IjExMDAiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNiIgc3Ryb2tlPSIjZmZjMTEzIiBzdHJva2Utd2lkdGg9IjEwIiAvPg0KICAgDQoNCiAgIDxjaXJjbGUgcj0iMzAwIiBjeT0iMTA1MCIgY3g9IjQ1MCIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4zIiBzdHJva2U9ImdyZWVuIiBzdHJva2Utd2lkdGg9IjEyIiAvPg0KICAgPGNpcmNsZSByPSIyMjAiIGN5PSI4MDAiIGN4PSIxNDUwIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjI3IiBzdHJva2U9InJlZCIgc3Ryb2tlLXdpZHRoPSIxMiIgLz4NCiAgIDxjaXJjbGUgcj0iNTUwIiBjeT0iMTIwMCIgY3g9IjE2MDAiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNCIgc3Ryb2tlPSIjZmZjMTEzIiBzdHJva2Utd2lkdGg9IjEyIiAvPg0KDQogIDwvZz4NCjwvc3ZnPg==)",
//           }}
//         >
//           <Row>
//             <Row style={{ height: "100%", width: "100%" }} justify="center">
//               <Col style={{ paddingTop: "5vh", zIndex: 2 }} span={6}>
//                 <img
//                   style={{ width: "100%" }}
//                   src="./../assets/images/mscorpres_auto_logo.png"
//                 />
//               </Col>
//             </Row>
//             <Row style={{ width: "100%" }} justify="center">
//               <Col style={{ whiteSpace: "nowrap", marginTop: 30 }}>
//                 <Title level={5}>Stay Tuned With Updated Stocks!</Title>
//                 <Divider />
//               </Col>
//             </Row>
//           </Row>
//           <Row justify="center" style={{ marginTop: "80%" }}>
//             <Col offset={1}>
//               <Text>
//                 IMS from 2019 - 2024. All Rights reserved | Performance &
//                 security by
//                 <Link
//                   style={{ marginLeft: 5 }}
//                   href="https://www.mscorpres.com"
//                 >
//                   MSCorpres Automation Pvt. Ltd.
//                 </Link>
//               </Text>
//             </Col>
//           </Row>
//         </div>
//       </Col>
//       <Col span={16}>
//         <Row
//           justify="center"
//           style={{ width: "100%", height: "100%" }}
//           align="middle"
//           gutter={[5, 5]}
//         >
//           <Col span={12}>
//             {showOTP ? (
//               <Card
//                 style={{
//                   height: 500,
//                   borderRadius: 12,
//                   boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//                   position: "relative",
//                 }}
//               >
//                 {/* <Button
//                   type="text"
//                   icon={<EditOutlined />}
//                   onClick={() => setShowCustomUrlModal(true)}
//                   style={{
//                     position: "absolute",
//                     top: 16,
//                     right: 16,
//                     zIndex: 10,
//                   }}
//                   title="Add Custom URL"
//                 /> */}
//                 <Title
//                   style={{
//                     color: "#04b0a8",
//                     textAlign: "center",
//                     marginBottom: 20,
//                     fontSize: 24,
//                     fontWeight: "bold",
//                   }}
//                   level={3}
//                 >
//                   Two-Factor Authentication
//                 </Title>

//                 <Text
//                   style={{
//                     textAlign: "center",
//                     display: "block",
//                     marginBottom: 30,
//                     color: "#666",
//                     fontSize: 14,
//                   }}
//                 >
//                   Enter the 6-digit verification code sent to your registered
//                   Email address (expires in 5 minutes)
//                 </Text>

//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     gap: 12,
//                     marginBottom: 20,
//                   }}
//                 >
//                   {otpCode.map((digit, index) => (
//                     <Input
//                       key={index}
//                       id={`otp-input-${index}`}
//                       value={digit}
//                       onChange={(e) => handleOtpChange(index, e.target.value)}
//                       onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                       maxLength={1}
//                       style={{
//                         width: 50,
//                         height: 50,
//                         textAlign: "center",
//                         fontSize: 18,
//                         fontWeight: "bold",
//                         border: digit
//                           ? "2px solid #04b0a8"
//                           : "1px solid #d9d9d9",
//                         borderRadius: 8,
//                       }}
//                     />
//                   ))}
//                 </div>

//                 <Text
//                   style={{
//                     textAlign: "center",
//                     display: "block",
//                     marginBottom: 30,
//                     color: "#666",
//                     fontSize: 14,
//                   }}
//                 >
//                   Code expires in {formatTimer(otpTimer)}
//                 </Text>

//                 <Button
//                   type="primary"
//                   size="large"
//                   block
//                   onClick={verifyOTP}
//                   loading={loading("verifyOtp")}
//                   style={{
//                     height: 45,
//                     fontSize: 16,
//                     fontWeight: "bold",
//                     marginBottom: 20,
//                     backgroundColor: "#04b0a8",
//                     borderColor: "#04b0a8",
//                   }}
//                 >
//                   Verify & Continue
//                 </Button>

//                 <div style={{ textAlign: "center" }}>
//                   <Button
//                     type="link"
//                     onClick={backToLogin}
//                     style={{ color: "#666" }}
//                   >
//                     <ArrowLeftOutlined /> Back to Sign In
//                   </Button>
//                 </div>

//                 <Alert
//                   message="For your security, this code will expire in 5 minutes. Never share this code with anyone."
//                   type="info"
//                   showIcon
//                   icon={<SafetyOutlined />}
//                   style={{
//                     marginTop: 20,
//                     backgroundColor: "#e6f7ff",
//                     borderColor: "#91d5ff",
//                     borderRadius: 8,
//                   }}
//                 />
//               </Card>
//             ) : signUpPage === "1" ? (
//               <Card style={{ height: 450, position: "relative" }}>
//                 {/* <Button
//                   type="text"
//                   icon={<EditOutlined />}
//                   onClick={() => setShowCustomUrlModal(true)}
//                   style={{
//                     position: "absolute",
//                     top: 16,
//                     right: 16,
//                     zIndex: 10,
//                   }}
//                   title="Add Custom URL"
//                 /> */}
//                 <Title
//                   style={{
//                     color: "gray",
//                     textAlign: "center",
//                     marginBottom: 20,
//                   }}
//                   level={4}
//                 >
//                   Secure Login To IMS
//                 </Title>
//                 <Form
//                   name="basic"
//                   layout="vertical"
//                   onFinish={handleSubmit}
//                   autoComplete="off"
//                   form={signUp}
//                 >
//                   {/* <Form.Item label="Company Branch" name="company_branch">
//                     <Select
//                       value={inpVal.company_branch}
//                       onChange={(v) => inputHandler("company_branch", v)}
//                       options={[
//                         { label: "A-21 [BRMSC012]", value: "BRMSC012" },
//                         { label: "B-29 [BRMSC029]", value: "BRMSC029" },
//                         { label: "B-36 Alwar [BRBA036]", value: "BRBA036" },
//                         { label: "D-160 [BRBAD116]", value: "BRBAD116" },
//                       ]}
//                       size="medium"
//                     />
//                   </Form.Item> */}
//                   <Form.Item
//                     label="Username / Mobile / CRN Number"
//                     name="username"
//                     rules={[
//                       {
//                         required: true,
//                         message:
//                           "Please provide either your email or phone number or CRN Nunber",
//                       },
//                     ]}
//                   >
//                     <Input
//                       value={inpVal.username}
//                       onChange={(e) =>
//                         inputHandler("username", e.target.value)
//                       }
//                       size="large"
//                     />
//                   </Form.Item>
//                   <Form.Item
//                     label="Password"
//                     name="password"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please input your password!",
//                       },
//                     ]}
//                   >
//                     <Input.Password
//                       value={inpVal.password}
//                       onChange={(e) =>
//                         inputHandler("password", e.target.value)
//                       }
//                       size="large"
//                     />
//                   </Form.Item>

//                   {forgotPassword === "0" ? (
//                     <>
//                       {/* <Form.Item
//                         label="Password"
//                         name="password"
//                         rules={[
//                           {
//                             required: true,
//                             message: "Please input your password!",
//                           },
//                         ]}
//                       >
//                         <Input.Password
//                           value={inpVal.password}
//                           onChange={(e) =>
//                             inputHandler("password", e.target.value)
//                           }
//                           size="large"
//                         />
//                       </Form.Item> */}
//                       {/* <Link onClick={() => setForgotPassword("1")}>
//                         Forgot Password
//                       </Link> */}
//                       <div className="flex justify-center">
//                         <ReCAPTCHA
//                           sitekey="6LdmVcArAAAAAOb1vljqG4DTEEi2zP1TIjDd_0wR"
//                           onChange={handleRecaptchaChange}
//                           key={recaptchaKey}
//                         />
//                       </div>
//                       <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
//                         <Button
//                           loading={loading("submit")}
//                           block
//                           size="large"
//                           type="primary"
//                           htmlType="submit"
//                           style={{ marginTop: "1em" }}
//                         >
//                           Log In
//                         </Button>
//                       </Form.Item>
//                       <Flex justify="end">
//                         <Button
//                           onClick={() => setShowForgotPassword(true)}
//                           type="link"
//                         >
//                           Forgot Password
//                         </Button>
//                       </Flex>
//                       <Text style={{ marginLeft: "8em" }}>
//                         {" "}
//                         Not Registered yet?
//                       </Text>
//                       <Link style={{ marginLeft: "1em" }} onClick={createAcc}>
//                         Create an Account
//                       </Link>
//                       <br />
//                     </>
//                   ) : (
//                     <>
//                       <Form.Item
//                         label="Confirm Password"
//                         name="confirmPassword"
//                         rules={[
//                           {
//                             required: true,
//                             message: "Please input your password!",
//                           },
//                         ]}
//                       >
//                         <Input.Password
//                           value={inpVal.password}
//                           onChange={(e) =>
//                             inputHandler("password", e.target.value)
//                           }
//                           size="large"
//                         />
//                       </Form.Item>
//                       <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
//                         <Button
//                           // loading={loading}
//                           block
//                           size="large"
//                           type="primary"
//                           htmlType="submit"
//                           style={{ marginTop: "1em" }}
//                           disabled={!ispassSame}
//                           onClick={setThePassword}
//                         >
//                           Reset Password
//                         </Button>
//                       </Form.Item>

//                       <Link style={{ marginLeft: "8em" }} onClick={back}>
//                         Back to Log In
//                       </Link>
//                       <Link
//                         style={{ marginLeft: "1em" }}
//                         onClick={() => setSignUpPage("2")}
//                       >
//                         Create an Account
//                       </Link>
//                     </>
//                   )}
//                 </Form>
//               </Card>
//             ) : (
//               <Card style={{ height: 600, position: "relative" }}>
//                 {/* <Button
//                   type="text"
//                   icon={<EditOutlined />}
//                   onClick={() => setShowCustomUrlModal(true)}
//                   style={{
//                     position: "absolute",
//                     top: 16,
//                     right: 16,
//                     zIndex: 10,
//                   }}
//                   title="Add Custom URL"
//                 /> */}
//                 <Title
//                   style={{
//                     color: "gray",
//                     textAlign: "center",
//                     marginBottom: 20,
//                   }}
//                   level={4}
//                 >
//                   Register To IMS
//                 </Title>
//                 <Form
//                   name="basic"
//                   layout="vertical"
//                   onFinish={handleSubmit}
//                   autoComplete="off"
//                   form={signUp}
//                 >
//                   <Form.Item
//                     label="Full Name"
//                     name="name"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please provide your name",
//                       },
//                     ]}
//                   >
//                     <Input
//                       value={inpVal.name}
//                       onChange={(e) => inputHandler("name", e.target.value)}
//                       size="large"
//                     />
//                   </Form.Item>
//                   <Form.Item
//                     label="Mobile Number"
//                     name="number"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please provide phone number.",
//                       },
//                     ]}
//                   >
//                     <Input
//                       value={inpVal.number}
//                       onChange={(e) => inputHandler("number", e.target.value)}
//                       size="large"
//                     />
//                   </Form.Item>
//                   <Form.Item
//                     label="Email Address"
//                     name="username"
//                     rules={[
//                       {
//                         required: true,
//                         message:
//                           "Please provide either your email or phone number or CRN Nunber",
//                       },
//                     ]}
//                   >
//                     <Input
//                       value={inpVal.username}
//                       onChange={(e) =>
//                         inputHandler("username", e.target.value)
//                       }
//                       size="large"
//                     />
//                   </Form.Item>

//                   <Form.Item
//                     label="Password"
//                     name="password"
//                     rules={[
//                       {
//                         required: true,
//                       },
//                     ]}
//                   >
//                     <Input.Password />
//                   </Form.Item>

//                   {/* Field */}
//                   <Form.Item
//                     label="Confirm Password"
//                     name="password2"
//                     dependencies={["password"]}
//                     rules={[
//                       {
//                         required: true,
//                       },
//                       ({ getFieldValue }) => ({
//                         validator(_, value) {
//                           if (!value || getFieldValue("password") === value) {
//                             return Promise.resolve();
//                           }
//                           return Promise.reject(
//                             new Error(
//                               "The new password that you entered do not match!"
//                             )
//                           );
//                         },
//                       }),
//                     ]}
//                   >
//                     <Input.Password />
//                   </Form.Item>
//                 </Form>
//                  <div className="flex justify-center">
//                         <ReCAPTCHA
//                           sitekey="6LdmVcArAAAAAOb1vljqG4DTEEi2zP1TIjDd_0wR"
//                           onChange={handleRecaptchaChange}
//                           key={recaptchaKey}
//                         />
//                       </div>
//                 <Button
//                   // loading={loading}
//                   block
//                   size="large"
//                   type="primary"
//                   htmlType="submit"
//                   style={{ marginTop: "2em" }}
//                   onClick={() => validatecreateNewUser()}
//                 >
//                   Sign Up
//                 </Button>
//                 <Row justify="center" style={{ marginTop: "1em" }}>
//                   <Link style={{ marginLeft: "1em" }} onClick={back}>
//                     Back to Log In
//                   </Link>
//                 </Row>
//               </Card>
//             )}
//           </Col>
//         </Row>
//       </Col>
//     </Row>
//     <Modal
//       title="Add Custom URL"
//       open={showCustomUrlModal}
//       onCancel={() => setShowCustomUrlModal(false)}
//       footer={null}
//       width={600}
//     >
//       <SelectEndPoint />
//     </Modal>
//   </div>

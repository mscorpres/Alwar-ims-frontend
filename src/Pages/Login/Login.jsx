import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "swiper/css";
import "swiper/css/pagination";
import ForgotPassword from "./ForgotPassword.tsx";
import "swiper/css/effect-fade";
import { Box } from "@mui/material";
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
import { useToast } from "../../hooks/useToast.js";

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
  const [otpTimer, setOtpTimer] = useState(600);
  const [userCredentials, setUserCredentials] = useState(null);
  const [showCustomUrlModal, setShowCustomUrlModal] = useState(false);
  const { executeFun, loading } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

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
    if (!recaptchaValue) {
      toast.error("Please verify the reCAPTCHA");
      return;
    }
    const { username, password } = inpVal;
    if (username === "" && password === "") {
      showToast("Please fill the field", "error");
    } else if (username === "") {
      showToast("username Field is Empty", "error");
    } else if (password === "") {
      showToast("password fill is empty", "error");
    } else {
      const res = await executeFun(
        () =>
          imsAxios.post("/auth/signin", {
            username: username,
            password: password,
          }),
        "submit"
      );
      if (res?.success) {
        const isTwoStep = res?.data?.isTwoStep;
        if (isTwoStep === "Y") {
          // Two-step login, show OTP screen
          setUserCredentials({
            username,
            token: res?.data?.token,
            qrCode: res?.data?.qrCode,
            company_branch: inpVal.company_branch, // Store selected branch for OTP flow
          });
          setShowOTP(true);
          setOtpTimer(600); // Reset timer to 10 minutes
          showToast("OTP sent to your registered email address", "success");
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
          showToast("Login successful!");
          navigate("/");
        }
      } else {
        setRecaptchaValue(null);
        setRecaptchaKey(Math.random());
        showToast(res?.message, "error");
      }
      // dispatch(
      //   loginAuth({ username: inpVal.username, password: inpVal.password })
      // );
    }
  };
  const validatecreateNewUser = async () => {
    if (!recaptchaValue) {
      showToast("Please verify the reCAPTCHA", "error");
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
      showToast(response.message, "success");
      setSignUpPage("1");
      signUp.resetFields();
    } else {
      showToast(response.message?.msg || response.message, "error");
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
      showToast(response.message, "success");
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
      showToast("OTP has expired. Please login again.", "error");
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
  // OTP Paste Handler
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const pastedOtp = pastedText.replace(/\D/g, "").slice(0, 6);

    if (pastedOtp.length > 0) {
      const newOtpCode = ["", "", "", "", "", ""];
      for (let i = 0; i < pastedOtp.length; i++) {
        newOtpCode[i] = pastedOtp[i];
      }
      setOtpCode(newOtpCode);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedOtp.length, 5);
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-input-${nextIndex}`);
        if (nextInput) nextInput.focus();
      }, 0);
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
      showToast("Please enter the complete 6-digit OTP", "error");
      return;
    }

    if (!userCredentials?.token) {
      showToast("Session expired. Please login again.", "error");
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
        showToast("Login successful!");

        // toast.success("Login successful!");
        navigate("/");
        window.location.reload();
      } else {
        showToast(res?.message || "Invalid OTP. Please try again.", "error");
        setOtpCode(["", "", "", "", "", ""]);
      }
    } catch (error) {
      showToast("Invalid OTP. Please try again.", "error");
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
    <div className="flex justify-center items-center h-[calc(100vh-30px)]">
           <ForgotPassword
        show={showForgotPassword}
        hide={() => setShowForgotPassword(false)}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",

          maxWidth: "900px",
          overflow: "hidden",
          // backgroundColor:"red",
          borderRadius: "20px",
          border: "1px solid #ccc",
          gap: 20,
          padding: 40,
          position: "relative",
        }}
      >
        <div>
          <div>
            <img
              src={"/assets/images/mscorpres_auto_logo.png"}
              alt="Oakter Logo"
              className="w-[150px] h-[auto]"
            />
            <div style={{ position: "absolute", bottom: 40, left: 40 }}>
              {" "}
              {signUpPage === "1" && !showOTP ? (
                <div>
                  <Text>Don't have an account? </Text>
                  <span
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      color: "blue",
                    }}
                    onClick={createAcc}
                  >
                    Sign Up
                  </span>
                </div>
              ) : showOTP ? (
                <Button
                  type="link"
                  onClick={backToLogin}
                  style={{ color: "#666" }}
                >
                  <ArrowLeftOutlined /> Back to Sign In
                </Button>
              ) : (
                <span onClick={back}>
                  If you have an account,{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      color: "blue",
                    }}
                  >
                    Login
                  </span>
                </span>
              )}{" "}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center ">
          <Row
            justify="center"
            style={{ width: "100%", maxWidth: "600px" }}
            align="middle"
            gutter={[5, 5]}
          >
            <Col span={24}>
              {showOTP ? (
                <Box
                  style={{
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
                        onPaste={index === 0 ? handleOtpPaste : undefined}
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
                </Box>
              ) : signUpPage === "1" ? (
                <Box style={{ position: "relative" }}>
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

                      marginBottom: 20,
                    }}
                    level={4}
                  >
                    Log in to your account
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
                        onChange={(e) =>
                          inputHandler("username", e.target.value)
                        }
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
                        onChange={(e) =>
                          inputHandler("password", e.target.value)
                        }
                        size="large"
                      />
                    </Form.Item>
                    <Flex justify="end">
                      <Button
                        onClick={() => setShowForgotPassword(true)}
                        type="link"
                      >
                        Forgot Password?
                      </Button>
                    </Flex>

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
                </Box>
              ) : (
                <Box style={{ position: "relative" }}>
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

                      marginBottom: 20,
                    }}
                    level={4}
                  >
                    Sign Up to get started
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
                        onChange={(e) =>
                          inputHandler("username", e.target.value)
                        }
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
                </Box>
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
    </div>
  );
};

export default Login;

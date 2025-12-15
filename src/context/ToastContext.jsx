import  { createContext, useState } from "react";
import ToastShow from "../Components/ToastShow";

export const ToastCreateContext = createContext(undefined);

export const ToastContext = ({ children }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
   
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  return (
    <ToastCreateContext.Provider value={{ showToast }}>
      {children}
      <ToastShow
        isOpen={toastOpen}
        msg={toastMessage}
        type={toastType}
        onClose={handleToastClose}
      />
    </ToastCreateContext.Provider>
  );
};
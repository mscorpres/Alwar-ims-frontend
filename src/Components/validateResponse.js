import { toast } from "react-toastify";
import errorToast from "./errorToast";

const validateResponse = (data, showToast) => {
  if (data?.success) {
    if (showToast) {
      toast.success(data.message);
    }
    return data?.data;
  } else {

      if (data.message) {
        return toast.error(data.message);
      } else {
        return toast.error(errorToast(data.message));
      }
   
  }
};

export default validateResponse;

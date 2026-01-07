import { useToast } from "../hooks/useToast";

const validateResponse = (data, showToast) => {
  const { showToast: show } = useToast();
  if (data?.success) {
    if (showToast) {
      show(data.message);
    }
    return data?.data;
  } else {
    if (data.message) {
      return show(data.message, "error");
    } else {
      return show(data?.message || "Something went wrong", "error");
    }
  }
};

export default validateResponse;

import { imsAxios } from "../axiosInterceptor";

export async function deleteAllNotifications() {
  return imsAxios.post("/notifications/delete-all", {});
}

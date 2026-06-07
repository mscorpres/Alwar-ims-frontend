import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebaseConfig";
import { imsAxios } from "../axiosInterceptor";

// Public VAPID key — used by the browser to authenticate push subscriptions with FCM
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

// Cookie helpers
const COOKIE_NAME = "WPN_UUID";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function getFCMCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setFCMCookie(token) {
  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `max-age=${COOKIE_MAX_AGE}`,
    "path=/",
    "SameSite=Strict",
    window.location.protocol === "https:" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function registerFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return;

    if (getFCMCookie() === token) return;

    await imsAxios.get(`/auth/register/wpn=${token}`);

    setFCMCookie(token);
  } catch (err) {
    console.error("FCM registration failed:", err);
  }
}

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
};

const isConfigValid = Object.values(firebaseConfig).every(Boolean);

let app = null;
if (isConfigValid) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("Firebase init failed:", e);
  }
}

export const getFirebaseMessaging = async () => {
  if (!app) return null;
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (e) {
    return null;
  }
};

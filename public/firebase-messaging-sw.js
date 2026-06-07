importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Service workers are static files — Vite env vars don't work here, values are hardcoded from .env
firebase.initializeApp({
  apiKey: "AIzaSyC0CJoj_bcUoQVGUI_1K0pctK9DEIvG7ZM",
  authDomain: "ims-notification-system.firebaseapp.com",
  projectId: "ims-notification-system",
  storageBucket: "ims-notification-system.firebasestorage.app",
  messagingSenderId: "527166198652",
  appId: "1:527166198652:web:2964a96649f5ea289e8af9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "New Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || "/assets/images/ms.png",
    badge: "/assets/images/favicon.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) return clientList[0].focus();
        return clients.openWindow("/");
      })
  );
});

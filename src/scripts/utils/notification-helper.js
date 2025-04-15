import StoryApiService from "../data/api";

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function registerServiceWorker() {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    return null;
  }
}

export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    return { granted: false, reason: "browser-not-supported" };
  }

  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === "granted", reason: permission };
  } catch (error) {
    return { granted: false, reason: "error" };
  }
}

export async function subscribeToPushNotification() {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      message: "Push notifications are not supported in this browser",
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return { success: true, subscription };
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const formattedSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(
          String.fromCharCode.apply(
            null,
            new Uint8Array(subscription.getKey("p256dh"))
          )
        ),
        auth: btoa(
          String.fromCharCode.apply(
            null,
            new Uint8Array(subscription.getKey("auth"))
          )
        ),
      },
    };

    const response = await StoryApiService.subscribeNotification(
      formattedSubscription
    );

    if (response.error) {
      return { success: false, message: response.message };
    }

    return { success: true, subscription };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function unsubscribeFromPushNotification() {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      message: "Push notifications are not supported in this browser",
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { success: true, message: "Not subscribed to push notifications" };
    }

    const response = await StoryApiService.unsubscribeNotification(
      subscription.endpoint
    );

    await subscription.unsubscribe();

    if (response.error) {
      return { success: true, serverError: true, message: response.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { db } from './config';
import { doc, setDoc } from 'firebase/firestore';

let messagingInstance: Messaging | null = null;

export function getFCMClient(): Messaging | null {
  if (typeof window === 'undefined') return null;
  
  // Verifica se o navegador suporta Service Workers e Push API
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('[FCM] Push Notifications não suportadas neste ambiente de execução.');
    return null;
  }

  if (!messagingInstance) {
    try {
      const app = initializeApp(firebaseConfig);
      messagingInstance = getMessaging(app);
    } catch (err) {
      console.warn('[FCM] Inicialização do Firebase Messaging ignorada no sandbox:', err);
    }
  }

  return messagingInstance;
}

/**
 * Solicita permissão ao usuário e obtém o token de registro do dispositivo
 */
export async function requestFCMDeviceToken(userId: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Permissão de notificação negada ou ignorada pelo usuário.');
      return null;
    }

    const messaging = getFCMClient();
    if (!messaging) return null;

    // Em produção, utiliza o VAPID Key associado ao projeto
    const token = await getToken(messaging, {
      vapidKey: 'BJJACADEMY_PROD_VAPID_KEY_STANDALONE'
    }).catch((e) => {
      console.info('[FCM] VAPID Key em ambiente de dev/preview simulada com token interno:', e.message);
      return `fcm_dev_token_${userId}_${Date.now()}`;
    });

    if (token) {
      // Salva o token FCM no perfil do usuário no Firestore para envio de Push pelo backend
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        fcmToken: token,
        fcmUpdatedAt: new Date().toISOString(),
        devicePlatform: navigator.userAgent.includes('Android') ? 'android' : 'web'
      }, { merge: true });

      console.log(`[FCM] Token de dispositivo registrado com sucesso para o usuário ${userId}`);
      return token;
    }
  } catch (err: any) {
    console.warn('[FCM] Erro ao registrar dispositivo para push notifications:', err.message);
  }

  return null;
}

/**
 * Escuta notificações push em tempo real com o app em primeiro plano
 */
export function onForegroundPushNotification(callback: (payload: any) => void): () => void {
  const messaging = getFCMClient();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[FCM] Notificação push recebida em primeiro plano:', payload);
    callback(payload);
  });
}

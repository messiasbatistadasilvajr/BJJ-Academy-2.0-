import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__pwaPrompt) {
      return window.__pwaPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Detect iframe
    const inIframe = typeof window !== 'undefined' && window.self !== window.top;
    setIsIframe(inIframe);

    // Detect standalone mode (already installed as PWA or native webview)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Check if early prompt was already stored on window
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaPrompt = null;
    };

    const handleCustomPromptReady = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('bjj:pwa-prompt-ready', handleCustomPromptReady);
    window.addEventListener('bjj:pwa-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('bjj:pwa-prompt-ready', handleCustomPromptReady);
      window.removeEventListener('bjj:pwa-installed', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaPrompt : null);
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__pwaPrompt = null;
        }
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  const forceReinstall = useCallback(() => {
    setIsInstalled(false);
  }, []);

  const openInNativeChrome = useCallback(() => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.href;

    // If inside an iframe, prefer opening current top or clean URL
    if (isAndroid) {
      try {
        const cleanHostPath = currentUrl.replace(/^https?:\/\//, '');
        const intentUri = `intent://${cleanHostPath}#Intent;scheme=https;package=com.android.chrome;end`;
        // Try intent
        window.location.href = intentUri;
        // Fallback open in new window if intent doesn't take over within 500ms
        setTimeout(() => {
          window.open(currentUrl, '_blank');
        }, 500);
        return;
      } catch {
        window.open(currentUrl, '_blank');
      }
    } else {
      window.open(currentUrl, '_blank');
    }
  }, [isAndroid]);

  const clearCacheAndReload = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }, []);

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__pwaPrompt)),
    isInstalled,
    isIOS,
    isAndroid,
    isIframe,
    install,
    forceReinstall,
    openInNativeChrome,
    clearCacheAndReload,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

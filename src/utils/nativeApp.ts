import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Initializes native Android device features when running inside Capacitor.
 * Safe to call in browser/web environments (will gracefully no-op).
 */
export async function initializeNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Configure Android Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#020617' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.debug('StatusBar setup note:', err);
  }

  try {
    // 2. Hide Splash Screen cleanly once web content is ready
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (err) {
    console.debug('SplashScreen setup note:', err);
  }

  try {
    // 3. Handle Android Hardware Back Button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // If at root, prompt or minimize rather than abrupt exit
        CapApp.minimizeApp();
      }
    });
  } catch (err) {
    console.debug('BackButton setup note:', err);
  }
}

/**
 * Triggers native haptic feedback on Android devices.
 */
export async function triggerNativeHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light'
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    // Safe ignore if haptics hardware not available
  }
}

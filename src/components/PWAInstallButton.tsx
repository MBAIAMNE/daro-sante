import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Check, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled || installSuccess) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
        <Check className="w-3.5 h-3.5" />
        Application installée
      </span>
    );
  }

  const handleInstallClick = async () => {
    const res = await install();
    if (res) setInstallSuccess(true);
  };

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 rounded-lg bg-[#0B3C5D] hover:bg-[#1E88E5] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all"
        title="Installer l'application DARÔ sur votre appareil"
      >
        <Download className="w-3.5 h-3.5 text-teal-300" />
        <span>Installer l'app</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
          <span>Installer PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-[#0B3C5D] mb-3">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold">Installer DARÔ sur iPhone / iPad</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pour utiliser DARÔ comme une vraie application médicale en plein écran :
              </p>
              <ol className="text-xs text-slate-700 space-y-2 mb-5 list-decimal pl-4">
                <li>Appuyez sur le bouton <strong>Partager</strong> <span className="text-sky-600 font-bold">[ ⎋ ]</span> dans Safari.</li>
                <li>Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</li>
                <li>Confirmez en cliquant sur <strong>Ajouter</strong> en haut à droite.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-[#0B3C5D] py-2 text-xs font-medium text-white hover:bg-[#1E88E5] transition"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback button to explain installability
  return (
    <button
      id="pwa-guide-btn"
      onClick={() => setShowIOSGuide(true)}
      className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 hover:bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      title="Application compatible mobile & bureau PWA"
    >
      <Smartphone className="w-3.5 h-3.5 text-teal-600" />
      <span>App mobile disponible</span>
    </button>
  );
};

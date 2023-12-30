import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import type { IWebApp, ITelegramUser } from "./types";

export interface ITelegramContext {
  webApp?: IWebApp;
  user?: ITelegramUser;
  unsafeData?: any; // Add type if available,
  // logs?: string[];
  // appendLog?: (message: string) => void;
}

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramContext = createContext<ITelegramContext>({});

// Custom hook to dynamically load scripts
const useScript = (src: string) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src]);
};

export const TelegramProvider: React.FC<TelegramProviderProps> = ({
  children,
}) => {
  const [webApp, setWebApp] = useState<IWebApp | null>(null);
  // const [logs, setLogs] = useState<string[]>([]);

  // const appendLog = useCallback((message: string) => {
  //   setLogs((currentLogs) => [...currentLogs, message]);
  // }, []);

  const handleReady = async () => {
    const webApp = (window as any).Telegram?.WebApp;
    const response = await fetch(`/validate-init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webApp.initDataUnsafe),
    });
    const data = await response.json();
    // appendLog(JSON.stringify(data));
    console.log("validate, repsonse", data);
  };

  useScript("https://telegram.org/js/telegram-web-app.js");

  useEffect(() => {
    const telegramWebApp = (window as any).Telegram?.WebApp;
    if (telegramWebApp) {
      telegramWebApp.ready();
      setWebApp(telegramWebApp);
      console.log(
        "vite env",
        import.meta.env.VITE_BACKEND_URL,
        import.meta.env.BACKEND_URL
      );
    }
  }, []);

  // Memoize so there is no re-render when the value object is the same
  const value = useMemo(() => {
    return webApp
      ? {
          webApp,
          unsafeData: webApp.initDataUnsafe,
          user: webApp.initDataUnsafe?.user,
        }
      : {};
  }, [webApp]);

  useEffect(() => {
    // This event is fired when the web app is ready, send to backend to validate init data.
    if (webApp) {
      handleReady();
    }
  }, [webApp]);

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);

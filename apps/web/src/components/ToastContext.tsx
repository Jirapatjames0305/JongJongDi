"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastCtx {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 bg-slate-800/90 backdrop-blur text-white px-6 py-3 rounded-full md:rounded-lg shadow-xl z-50 flex items-center gap-3 min-w-[300px] justify-center md:justify-start transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-24"}`}
      >
        <i className="fa-solid fa-circle-check text-green-400"></i>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

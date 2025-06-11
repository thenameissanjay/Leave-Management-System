import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "./toast";

const ToastContext = createContext();

let toastCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast List */}
      <div className="fixed top-5 right-5 z-50 flex flex-col items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} remove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom Hook
export const useToast = () => useContext(ToastContext);

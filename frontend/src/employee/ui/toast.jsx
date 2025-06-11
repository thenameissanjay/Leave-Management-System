import React, { useEffect } from "react";

const Toast = ({ id, message, type = "info", remove, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => remove(id), duration);
    return () => clearTimeout(timer);
  }, [id, remove, duration]);

  const typeStyles = {
    info: "bg-blue-100 text-blue-800 border-blue-300",
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div
      className={`mb-2 px-4 py-2 rounded border shadow text-sm animate-slide-in ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
};

export default Toast;

import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseOptions = {
  position: "top-right",
  autoClose: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: Slide,
  style: {
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 500,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "12px 16px",
  },
  progressStyle: {
    height: "4px",
    borderRadius: "2px",
  },
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    ...baseOptions,
    style: {
      ...baseOptions.style,
      backgroundColor: "#d1fae5",
      color: "#065f46",
      border: "1px solid #047857",
    },
    progressStyle: {
      ...baseOptions.progressStyle,
      background: "#10b981",
    },
    icon: "✅",
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    ...baseOptions,
    style: {
      ...baseOptions.style,
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #b91c1c",
    },
    progressStyle: {
      ...baseOptions.progressStyle,
      background: "#ef4444",
    },
    icon: "❌",
  });
};

export const showWarningToast = (message) => {
  toast.warn(message, {
    ...baseOptions,
    style: {
      ...baseOptions.style,
      backgroundColor: "#fef3c7",
      color: "#78350f",
      border: "1px solid #b45309",
    },
    progressStyle: {
      ...baseOptions.progressStyle,
      background: "#f59e0b",
    },
    icon: "⚠️",
  });
};

export const GlobalToast = () => (
  <ToastContainer
    position="top-right"
    newestOnTop
    closeOnClick
    pauseOnFocusLoss={false}
    limit={5}
    toastStyle={{
      borderRadius: "12px",
      fontSize: "0.95rem",
      fontWeight: 500,
      padding: "12px 16px",
    }}
  />
);

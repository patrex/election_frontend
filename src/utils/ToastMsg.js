import { toast, Slide } from "react-toastify";

const opts = {
	position: "top-right",
	autoClose: 3000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: "dark",
	transition: Slide,
}

const Toast = {
  success: (message, options = opts) => {
    toast.success(message, { ...options });
  },
  error: (message, options = opts) => {
    toast.error(message, { ...options });
  },
  info: (message, options = opts) => {
    toast.info(message, { ...options });
  },
  warning: (message, options = opts) => {
    toast.warning(message, { ...options });
  },
};

export default Toast;

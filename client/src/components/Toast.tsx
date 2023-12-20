import { Toaster } from "react-hot-toast";

const Toast = ({ children }: any) => {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </div>
  );
};

export default Toast;

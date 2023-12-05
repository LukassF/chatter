import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

export const fetchApi = (
  setData: React.Dispatch<React.SetStateAction<any>>,
  setError: React.Dispatch<React.SetStateAction<any>>,
  setLoading: React.Dispatch<React.SetStateAction<any>>,
  params: AxiosRequestConfig<any>
): Function => {
  //return a function to use at any time in a component
  return async () => {
    // let axs = axios;

    // if (params.url?.includes("api")) {
    //   const axiosJWT = axios.create();

    //   axiosJWT.interceptors.request.use(
    //     async (config) => {
    //       let current_date = new Date();

    //       const token = config.headers && config.headers["authorization"];
    //       if (!token) throw new Error("No token provided");

    //       let decoded_token = jwtDecode(token);
    //       if (
    //         decoded_token.exp! * 1000 < current_date.getTime()
    //       ) {
    //         const data = await

    //       }

    //       return config;
    //     },
    //     (error) => {
    //       return Promise.reject(error);
    //     }
    //   );
    // }
    setLoading(true);
    try {
      let data = await axios.request(params);
      setData(data);
      console.log(data);
    } catch (err: any) {
      console.log(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };
};

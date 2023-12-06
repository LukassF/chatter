import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from "./constants";

export const fetchApi = (
  setData: React.Dispatch<React.SetStateAction<any>>,
  setError: React.Dispatch<React.SetStateAction<any>>,
  setLoading: React.Dispatch<React.SetStateAction<any>>
): Function => {
  //return a function to use at any time in a component
  return async (params: AxiosRequestConfig<any>) => {
    //automatic token refresh
    if (params.url?.includes("api")) {
      let current_date = new Date();

      const token =
        params.headers && params.headers["Authorization"].split(" ")[1];
      if (!token) throw new Error("No token provided");

      let decoded_token = jwtDecode(token);
      if (decoded_token.exp! * 1000 < current_date.getTime()) {
        const token_from_ls = window.localStorage.getItem("refresh_token");
        const refresh_token = token_from_ls && JSON.parse(token_from_ls);

        const { data } = await axios.post(BACKEND_URL + "auth/refresh", {
          refresh_token,
        });

        params.headers!["Authorization"] = "Bearer " + data.access_token;

        window.localStorage.setItem(
          "access_token",
          JSON.stringify(data.access_token)
        );
      }
    }

    setLoading(true);
    try {
      let data = await axios.request(params);
      setData(data);
      //   console.log(data);
    } catch (err: any) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };
};

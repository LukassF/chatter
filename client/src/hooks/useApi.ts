import axios, { AxiosRequestConfig } from "axios";
import { useState, useEffect } from "react";

const useApi = (params: AxiosRequestConfig<any>, run_immediately: boolean) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      let data = await axios.request(params);
      setData(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!run_immediately)
    return [null, "Not enough arguments", null, fetchData] as const;

  useEffect(() => {
    fetchData();
  }, []);

  return [data, error, loading, fetchData] as const;
};

export default useApi;

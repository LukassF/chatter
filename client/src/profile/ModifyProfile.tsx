import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../store/store";
import { fetchApi } from "../utils/api/fetchApi";
import { ALLOWED_TYPES, BACKEND_URL } from "../utils/api/constants";

const ModifyProfile = () => {
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const fileInput = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<Record<any, any>>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const changeData = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      let base64: any = "";
      const image = (event.target as any).image.files[0] as File;
      const username = (event.target as any).username.value;
      const password = (event.target as any).password.value;
      const password_repeat = (event.target as any).password_repeat.value;

      if (password != password_repeat)
        return console.log("Passwords have to match");

      if (password.length < 6 && password.length > 0)
        return console.log("Password has to be at least 6 characters long");

      if (image) {
        const extension = image.type.split("/")[1];
        if (!ALLOWED_TYPES.includes(extension))
          return console.log("File type not supported");

        base64 = await toBase64(image);
      }

      console.log(base64);

      setPayload({ user_id: current_user?.id, base64, username, password });
    },
    [current_user]
  );

  const toBase64 = useCallback(
    (file: File): Promise<string | ArrayBuffer | null> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("Error while converting to base64");
      });
    },
    []
  );

  useEffect(() => {
    if (access_token && payload)
      fetchData({
        url: BACKEND_URL + "api/users/modify",
        method: "POST",
        data: payload,
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [payload, access_token]);

  useEffect(() => {
    if (success) window.location.reload();
  }, [success]);

  return (
    <>
      <h3>Modify profile</h3>

      <form onSubmit={changeData}>
        <input
          type="file"
          placeholder="image"
          name="image"
          ref={fileInput}
          style={{ display: "none" }}
        ></input>
        <button type="button" onClick={() => fileInput.current?.click()}>
          Select image
        </button>
        <input type="text" placeholder="username" name="username"></input>
        <input
          type="password"
          placeholder="New password"
          name="password"
        ></input>
        <input
          type="password"
          placeholder="Repeat new password"
          name="password_repeat"
        ></input>

        <button>Confirm</button>
      </form>
    </>
  );
};

export default ModifyProfile;

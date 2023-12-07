import { jwtDecode } from "jwt-decode";
import { TokenDecode } from "./types";

export const decodeToken = (token?: string) => {
  if (!token) return null;
  const access_token_decoded = jwtDecode(token);
  const user = (access_token_decoded as TokenDecode).user;

  return user;
};

import { jwtDecode } from "jwt-decode";
import { TokenDecode } from "./types";

export const decodeToken = (token: string) => {
  const access_token_decoded = jwtDecode(token);
  const user = (access_token_decoded as TokenDecode).user;

  return user;
};

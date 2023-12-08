import { JwtPayload } from "jwt-decode";
import { User } from "../store/features/currentUserSlice";

type SignupData = {
  username: string;
  email: string;
  password: string;
};

type LoginData = Omit<SignupData, "email">;

interface TokenDecode extends JwtPayload {
  user: User;
}

interface Message {
  content: string;
  user_id: number;
  chat_id: number;
  image: string | null;
  created_at: string;
  id: number;
}

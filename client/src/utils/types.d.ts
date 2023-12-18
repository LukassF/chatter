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

interface Chat {
  id: number | null;
  name: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  users?: ChatMember[];
  message: number;
  message_created_at: string;
  message_user_id: number;
  last_message_id: number | null;
}

interface ChatMember {
  id: number | null;
  username: string | null;
  email: string | null;
  image: string | null;
  has_seen: number | null;
}

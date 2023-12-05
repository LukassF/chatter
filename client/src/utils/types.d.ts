type SignupData = {
  username: string;
  email: string;
  password: string;
};

type LoginData = Omit<SignupData, "email">;

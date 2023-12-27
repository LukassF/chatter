import { FC } from "react";
import Signup from "./components/Signup";

const SignupPage: FC = () => {
  return (
    <main
      className="w-screen h-screen bg-cover bg-left bg-no-repeat flex justify-end overflow-hidden"
      style={{
        backgroundImage:
          "url('https://hips.hearstapps.com/hmg-prod/images/group-of-friends-having-fun-at-home-chatting-eating-royalty-free-image-1683834654.jpg?crop=1xw:0.84415xh;center,top')",
      }}
    >
      <div className=" bg-white w-screen sm:w-1/2 sm:min-w-[500px]  grid grid-rows-[15fr_1fr] overflow-auto p-4 sm:p-5">
        <div className="flex items-center justify-center">
          <Signup />
        </div>
        <footer className="text-sm xs:text-md text-center font-light">
          2023 Chatter ©
        </footer>
      </div>
    </main>
  );
};

export default SignupPage;

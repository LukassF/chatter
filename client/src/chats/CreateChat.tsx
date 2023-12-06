import { useState } from "react";
import FoundUsersList from "./foundUsersList";

const CreateChat = () => {
  const [input, setInput] = useState<string>();

  return (
    <>
      <h2>Create chat</h2>
      <h4>Find users</h4>
      <input
        type="text"
        placeholder="find"
        onChange={(e) => setInput(e.target.value)}
      />
      <FoundUsersList input={input} />
    </>
  );
};

export default CreateChat;

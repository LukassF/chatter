import { useCallback, FormEvent } from "react";

const MessageInput = () => {
  const sendMessage = useCallback((event: FormEvent) => {
    event.preventDefault();
    const message = (event.target as any).message.value;
    console.log(message);
  }, []);
  return (
    <>
      <form onSubmit={sendMessage}>
        <input type="text" placeholder="your message" name="message"></input>
        <button>send</button>
      </form>
    </>
  );
};

export default MessageInput;

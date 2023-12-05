import Login from "./login/Login";
import Signup from "./signup/Signup";

function App() {
  // const fetchData = async () => {
  //   try {
  //     const data = await axios.get(BACKEND_URL + "api/users", {
  //       headers: {
  //         Authorization:
  //           "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxMywidXNlcm5hbWUiOiJhYSIsImVtYWlsIjoiYWFAYmIuY2MifSwiaWF0IjoxNzAxODE0MTUwLCJleHAiOjE3MDE4MTUzNTB9.gAaAD_S87GSu3gSjaZvqCk-jdpCLfzapJXMU3bjerNI",
  //       },
  //     });
  //     console.log(data);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <>
      <Signup />
      <hr></hr>
      <Login />
    </>
  );
}

export default App;

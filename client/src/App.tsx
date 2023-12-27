import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import SignupPage from "./pages/signup/SignupPage";
import LoginPage from "./pages/login/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import Overlay from "./components/Overlay";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const href = window.location.href.split("/").pop();
    if (
      !window.localStorage.getItem("access_token") &&
      !window.localStorage.getItem("refresh_token") &&
      !["login", "signup"].includes(href as string)
    )
      window.location.reload();
  }, [
    window.localStorage.getItem("access_token"),
    window.localStorage.getItem("refresh_token"),
  ]);

  return (
    <>
      <Overlay />
      <Toast>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute path="/">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <ProtectedRoute path="/login">
                  <LoginPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoute path="/signup">
                  <SignupPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </Toast>
    </>
  );
}

export default App;

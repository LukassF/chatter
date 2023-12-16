import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import SignupPage from "./pages/signup/SignupPage";
import LoginPage from "./pages/login/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";

function App() {
  return (
    <>
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
            <Route
              path="/profile"
              element={
                <ProtectedRoute path="/profile">
                  <Profile />
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

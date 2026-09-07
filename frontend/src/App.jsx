import { Routes, Route } from "react-router";
import { Login, SignUp } from "./features/auth/components";
import { HomePage } from "./features/identify/components";
import ProtectedRoute from "./components/ProtectedRoute";
import { NavBar } from "./components";
function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </>
  );
}
export default App;

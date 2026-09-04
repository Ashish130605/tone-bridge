import useAuth from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { auth, loading } = useAuth();

  if (loading)
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  if (!auth?.email) {
    return <Navigate to={"/login"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

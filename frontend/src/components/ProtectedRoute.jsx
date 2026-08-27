import useAuth from "../hooks/useAuth";
import { Navigate, Outlet} from "react-router";

const ProtectedRoute = () => {
    const {auth} = useAuth();

    if(!auth?.email){
        return <Navigate to={"/login"} replace/>
    }

    return <Outlet />
}

export default ProtectedRoute;

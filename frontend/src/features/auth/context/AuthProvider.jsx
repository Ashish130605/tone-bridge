import { createContext, useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api-client";
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      try {
        const res = await apiFetch("/users/me");
        setAuth({ email: res.email });
      } catch (error) {
        if (error.message === "UNAUTHORIZED") setAuth({});
      }
      setLoading(false);
    }

    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;

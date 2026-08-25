import { useRef, useState, useEffect, useContext } from "react";
import { apiFetch } from "../../../lib/api-client";
import AuthContext  from "../context/AuthProvider";

export function Login() {
  const { setAuth } = useContext(AuthContext);
  const emailRef = useRef();
  const errorRef = useRef();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setError("");
  }, [email, password]);

  const handleSubmit = async () => {
    //e.preventDefault();
    try {
      const res = await apiFetch("/auth/jwt/login", {
        method: "POST",
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
      const accessToken = res.access_token;
      localStorage.setItem("access-token", accessToken); // TODO: implement httpOnly cookie for Authorization
      setAuth({email, password, accessToken});
      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      {success ? (
        <section>
          <h1>Login Success!</h1>
        </section>
      ) : (
        <section>
          <p
            ref={errorRef}
            className={error ? "error" : "offscreen"}
            aria-live="assertive"
          >
            {error}
          </p>

          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              placeholder="Enter your email..."
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="emailnote"
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password..."
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="pwdnote"
              required
            />
            <button>Login</button>
            
          </form>
          <p>
              Dont have an account?
              <a href="">Sign Up</a>
          </p>
        </section>
      )}
    </>
  );
}

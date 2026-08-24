import { useRef, useState, useEffect } from "react";
import { apiFetch } from "../../../lib/api-client";

export function Login() {
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
    try {
      const res = await apiFetch("/auth/jwt/login", {
        method: "POST",
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
      localStorage.setItem("access-token", res.access_token);
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
            <p>
              Dont have an account?
              <a href="">Sign Up</a>
            </p>
          </form>
        </section>
      )}
    </>
  );
}

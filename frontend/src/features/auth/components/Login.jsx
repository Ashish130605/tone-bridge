import { useRef, useState, useEffect } from "react";
import { apiFetch } from "../../../lib/api-client";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PWD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function Login() {
  const emailRef = useRef();
  const errorRef = useRef();

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [validPass, setValidPass] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPass(PWD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    setError("");
  }, [email, password]);

  const handleSubmit = async () => {
    const v1 = EMAIL_REGEX.test(email);
    const v2 = PWD_REGEX.test(password);

    if (!v1 && !v2) {
      setError("Invalid Inputs.");
      return;
    }

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
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="emailnote"
              required
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password..."
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={validPass ? "false" : "true"}
              aria-describedby="pwdnote"
              required
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
            />
            <button disabled={!validEmail || !validPass ? true : false}>
              Login
            </button>
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

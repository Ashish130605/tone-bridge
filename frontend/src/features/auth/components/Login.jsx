import { useRef, useState, useEffect } from "react";
import { Link, Navigate } from "react-router";
import { apiFetch } from "../../../lib/api-client";
import useAuth from "../../../hooks/useAuth";
import { FormField } from "../../../components/FormField";
import { Button } from "../../../components";
import styles from "./Auth.module.css";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

export function Login() {
  const { setAuth } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setAuth({ email, password, accessToken });
      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error.message === "400") {
        setError("Email or password is incorrect.");
      }
    }
  };

  if (success) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className={styles["card-container"]}>
        <h1>Login</h1>
        <p
          ref={errorRef}
          className={error ? styles.error : styles.offscreen}
          aria-live="assertive"
        >
          {error}
        </p>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="Email"
            icon={faEnvelope}
            type="email"
            ref={emailRef}
            placeholder="Enter your email..."
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="emailnote"
            required
          />

          <FormField
            id="password"
            label="Password"
            icon={faLock}
            type="password"
            placeholder="Enter your password..."
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="pwdnote"
            required
          />
          <Button>Login</Button>
        </form>
        <p>
          Dont have an account?
          <Link to={"/signup"}>Sign up!</Link>
        </p>
      </div>
    </>
  );
}

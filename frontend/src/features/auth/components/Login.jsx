import { useRef, useState, useEffect } from "react";
import { Link, Navigate } from "react-router";
import { apiFetch } from "../../../lib/api-client";
import useAuth from "../../../hooks/useAuth";
import { FormField } from "../../../components/FormField";
import { Button } from "../../../components";

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
      setError(error.message);
    }
  };

  if(success){
    return (
      <Navigate to={"/"} />
    );

  }

  return (
    <>
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
            <FormField 
              id = "email"
              label= "Email"
              type="email"
              ref={emailRef}
              placeholder="Enter your email..."
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="emailnote"
              required           
            />

            <FormField 
              id = "password"
              label= "Password"
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
        </section>
    </>
  );
}

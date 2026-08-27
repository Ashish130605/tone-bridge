import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../lib/api-client";
import './Signup.css';
import { Link } from "react-router";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PWD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function SignUp() {
  const emailRef = useRef();
  const errorRef = useRef();

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [validPass, setValidPass] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    const result = PWD_REGEX.test(password);
    setValidPass(result);
    const match = password === matchPwd;
    setValidMatch(match);
  }, [password, matchPwd]);

  useEffect(() => {
    setError("");
  }, [email, password, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v1 = EMAIL_REGEX.test(email);
    const v2 = PWD_REGEX.test(password);

    if (!v1 && !v2) {
      setError("Invalid Inputs");
      return;
    }
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      console.log(res);
      setSuccess(true);

      setEmail("");
      setPassword("");
      setMatchPwd("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {success ? (
        <section>
          <h1>Success!</h1>
          <p>
            <a href="#">Sign In</a>
          </p>
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

          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              placeholder="Enter your email (name@example.com)..."
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="emailnote"
              required
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />

            <p
              id="uidnote"
              className={
                emailFocus && email && !validEmail
                  ? "instructions"
                  : "offscreen"
              }
            >
              Please enter a valid email address.
            </p>

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
            <p
              id="pwdnote"
              className={
                passwordFocus && password && !validPass
                  ? "instructions"
                  : "offscreen"
              }
            >
              Please enter a valid password. <br />
              Password must contain at least 8 characters, uppercase and
              lowercase with a symbol. <br />
            </p>

            <label htmlFor="confirm_password">Confirm Password:</label>
            <input
              type="password"
              id="confirm_password"
              placeholder="Enter your password..."
              onChange={(e) => setMatchPwd(e.target.value)}
              aria-invalid={validPass ? "false" : "true"}
              aria-describedby="confirmnote"
              required
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <p
              id="confirmnote"
              className={
                matchFocus && !validMatch ? "instructions" : "offscreen"
              }
            >
              Password does'nt match.
            </p>

            <button
              disabled={!validEmail || !validPass || !validMatch ? true : false}
            >
              Submit
            </button>
          </form>

          <p>Already have an account? 
            <Link to={"/login"}>Login!</Link>
          </p>
        </section>
      )}
    </>
  );
}

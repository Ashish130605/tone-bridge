import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../lib/api-client";
import { FormField } from "../../../components/FormField";
import { Button } from "../../../components/Button";
import { Link } from "react-router";
import { Navigate } from "react-router";

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
          <Navigate to={"/login"} replace />
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
            <FormField 
              id = "email"
              label = "Email"
              type="email"
              ref={emailRef}
              placeholder="Enter your email (name@example.com)..."
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="emailnote"
              required
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              noteid = "uidnote"
              note = "Please enter a valid email address."
              showNote = {emailFocus && email && !validEmail}/>

          
          <FormField
            id = "password"
            label= "Password"
            type="password"
            placeholder="Enter your password..."
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={validPass ? "false" : "true"}
            aria-describedby="pwdnote"
            required
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            noteid="pwdnote"
            note = {"Please enter a valid password. Password must contain at least 8 characters, uppercase and lowercase with a symbol."} 
            showNote = {passwordFocus && password && !validPass}/>
            
           

            <FormField 
              id = "confirm_password"
              label= "Confirm Password"
              type="password"
              placeholder="Enter your password..."
              onChange={(e) => setMatchPwd(e.target.value)}
              aria-invalid={validPass ? "false" : "true"}
              aria-describedby="confirmnote"
              required
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
              noteid = "confirmnote"
              note = "Password does'nt match."
              showNote = {matchFocus && !validMatch}/>

            <Button
              disabled={!validEmail || !validPass || !validMatch ? true : false}
            >
              Submit
            </Button>
          </form>

          <p>Already have an account? 
            <Link to={"/login"}>Login!</Link>
          </p>
        </section>
      )}
    </>
  );
}

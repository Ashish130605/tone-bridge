import { useState } from "react";
import { Input } from "../../../components/Input";
export function Login(){
    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")

    return(
       <>
        <h1>
            Login Page
        </h1>
        <div>
            <Input name={"Email Address"} type={"text"} value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div>
            <Input name={"Password"} type={"text"} value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>

        <p>{email}</p>
        <p>{password}</p>


       </>
    );
}


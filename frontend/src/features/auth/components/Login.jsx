import { useState } from "react";
import { Input } from "../../../components/Input";
import { apiFetch } from "../../../lib/api-client";
export function Login(){
    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")

    const handleClick = async () => {
       const res = await apiFetch('/auth/jwt/login', {
            method: 'POST',
            body: new URLSearchParams({
                username : email,
                password : password
                }) 
        })
        localStorage.setItem("access-token" , res.access_token)
        alert("Successfuly logged in")
    }

    return(
       <>
        <h1>
            Login Page
        </h1>
        <div>
            <Input name={"Email Address"} type={"text"} value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div>
            <Input name={"Password"} type={"password"} value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>

        <div>
            <button onClick={handleClick}>Submit</button>
        </div>


       </>
    );
}


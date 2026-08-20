import { useState } from "react";
import { apiFetch } from "../../../lib/api-client";
import { Input } from "../../../components/Input";

export function SignUp(){
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [data , setData] = useState({});
    const [error, setError] = useState("");
    const handleClick = async () => {
       try{
        const res = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                "email": email,
                "password" : password
                }) 
        })
        setData(res)
       }
       catch(error){
        setError(error.message)
       }
        
    }
    
    
    return(
        <>
            <h1>
                Signup Page
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
            <p>{`${data.id} is registered`}</p>
            <p>{error}</p>        
        </>

    );
}


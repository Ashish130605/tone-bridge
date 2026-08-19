
const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options={}){
    const token = localStorage.getItem('access-token');
    const headerObj = new Headers();
    //if(token) headerObj.append("Authorization", "Bearer "+token)

    if(path == "/auth/jwt/login") headerObj.append("Content-Type", "application/x-www-form-urlencoded");
    else headerObj.append("Content-Type", "application/json");
    
    for (const [key, value] in Object.entries(options)) headerObj.append(key, value);
    const response = await fetch(BASE_URL+path, {
        method: options.method,
        headers:headerObj,
        Authorization:"Bearer " + token,
        body : options.body
    });

    if(response.status == 401) throw new Error("UNAUTHORIZED");
    if(!response.ok) throw new Error(`Error : ${response.status}`);
    
    const data = await response.json();
    return data
}


const response = apiFetch("/auth/jwt/login", {
    method:"POST",
    body: new URLSearchParams(
        {"username":"user1@example.com","password": "string@123"}
    )
})

console.log(response);

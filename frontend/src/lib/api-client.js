
const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options={}){
    const token = localStorage.getItem('access-token'); // LATER TODO: impolement httpOnly cookie for Authorization
    const headerObj = new Headers();
    if(token) headerObj.append("Authorization", `Bearer ${token}`)

    if(path == "/auth/jwt/login") headerObj.append("Content-Type", "application/x-www-form-urlencoded");
    else headerObj.append("Content-Type", "application/json");
    
    const response = await fetch(BASE_URL+path, {
        headers: headerObj,
        ...options
    });

    if(response.status == 401) throw new Error("UNAUTHORIZED");
    if(!response.ok) throw new Error(response.status);
    
    const data = await response.json();
    return data
}

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options={}){
    const headerObj = new Headers();

    if(path == "/auth/jwt/login") headerObj.append("Content-Type", "application/x-www-form-urlencoded");
    else headerObj.append("Content-Type", "application/json");
    
    const response = await fetch(BASE_URL+path, {
        credentials: 'include',
        headers: headerObj,
        ...options
    });

    if(response.status === 204) return null;
    if(response.status == 401) throw new Error("UNAUTHORIZED");
    if(!response.ok) throw new Error(response.status);
    
    const data = await response.json();
    return data
}
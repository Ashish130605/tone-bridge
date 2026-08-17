export function Input({name,type, value, onChange}){
    return(
        <label>
            {name}
            <input type={type} value={value} onChange={ onChange } />
        </label>
    )
}
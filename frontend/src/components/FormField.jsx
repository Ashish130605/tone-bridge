export function FormField({id, label, noteid, note, showNote = false, ...props}){
    return(
        <div>
            <label htmlFor={id}>
                {label}
            </label>
            <div>
                <input id={id}{...props}/>
            </div>
            {note ? (
            <p
              id={noteid}
              className={showNote ? "instructions" : "offscreen"}
            >
              {note}
            </p>) : null}

        </div>
    )
}
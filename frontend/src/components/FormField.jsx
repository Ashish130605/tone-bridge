import styles from "./FormField.module.css"
export function FormField({id, label, noteid, note, showNote = false, ...props}){
    return(
        <div className={styles["field-container"]}>
            <label className={styles["form-label"]} htmlFor={id}>
                {label}
            </label>
            <input className={styles["form-input"]} id={id}{...props}/>
            {note ? (
            <p
              id={noteid}
              className={showNote ? styles.instructions : styles.offscreen}
            >
              {note}
            </p>) : null}

        </div>
    )
}

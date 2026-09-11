import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "./FormField.module.css"
export function FormField({id, label, icon, noteid, note, showNote = false, ...props}){
    return(
        <div className={styles["field-container"]}>
            <label className={styles["form-label"]} htmlFor={id}>
                {label}
            </label>
            <div className={styles["input-wrapper"]}>
                {icon ? <FontAwesomeIcon icon={icon} /> : null}
                <input className={styles["form-input"]} id={id}{...props}/>
            </div>

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

import styles from "./Button.module.css"
export function Button({children , ...props}) {
    return (

            <button className={styles.button} {...props}>
                {children}
            </button>


    )
}

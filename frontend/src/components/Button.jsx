import styles from "./Button.module.css"
export function Button({variant, children , ...props}) {
    const className = `${styles.button} ${styles[variant]}`;
    return (

            <button className={className} {...props}>
                {children}
            </button>


    )
}

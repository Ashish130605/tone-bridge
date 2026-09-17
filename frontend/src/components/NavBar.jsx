import { Link } from "react-router"
import styles from "./NavBar.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeadphones, faHeadset } from "@fortawesome/free-solid-svg-icons"

export function NavBar() {
    return (
        <>
            <header className={styles.header}>
                <nav className={styles.navbar}>
                    <div className={styles.logo}>
                        <FontAwesomeIcon icon = {faHeadphones} />
                        ToneBridge
                    </div>
                    <ul className={styles.links}>
                        <li>
                            <Link to={"/"}>Home</Link>
                        </li>
                        <li>
                            <Link to={"/login"}>Login</Link>
                        </li>

                        <li>
                            <Link to={"#logout"}>Logout</Link>
                        </li>
                    </ul>

                </nav>

            </header>
        </>
    )
}

import { Link } from "react-router"
import styles from "./NavBar.module.css"

export function NavBar() {
    return (
        <>
            <header className={styles.header}>
                <nav className={styles.navbar}>
                    <div className={styles.logo}>
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

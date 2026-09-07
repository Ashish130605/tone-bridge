import { Link } from "react-router"

export function NavBar() {
    return (
        <>
            <header>
                <div>
                    <nav>
                        <ul>
                            <li>
                                <Link to={"/"}>Home</Link>
                            </li>
                            <li>
                                <Link to={"/login"}>Login</Link>
                            </li>

                            <li>
                                <Link to={"/signup"}>Signup</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div>
                    <span>
                        <Link to = "#Logout"> Logout </Link>
                    </span>
                </div>
            </header>
        </>
    )
}
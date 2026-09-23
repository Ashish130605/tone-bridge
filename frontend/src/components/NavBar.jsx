import { Link } from "react-router";
import useAuth from "../hooks/useAuth"
import { apiFetch } from "../lib/api-client";
import { useNavigate } from "react-router";
import styles from "./NavBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";

export function NavBar() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/auth/jwt/logout", {
        method: "POST",
      });
      if (res === null) {
        setAuth({});
        navigate("/login");
      }
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <>
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <FontAwesomeIcon icon={faHeadphones} />
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
              <Link onClick={handleLogout}>
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

import { Link, Routes, Route} from 'react-router'
import { Login, SignUp } from './features/auth/components'
import { HomePage } from './features/identify/components'
function App() {
    return(
        <>
            <div>
                <nav>
                    <Link to={"/"}>Home</Link>
                    <Link to={"/login"}>Login</Link>
                    <Link to={"/signup"}>Signup</Link>
                </nav>
            </div>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/" element={<HomePage />} />
            </Routes>
        </>
    );
}
export default App

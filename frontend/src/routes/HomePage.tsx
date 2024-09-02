import { Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";


function HomePage(){
    return(
        <Navbar>
            <Link className="nav-link" to="/login">
                Login
            </Link>
            <Link className="nav-link" to="/register">
                Register
            </Link>
        </Navbar>
    )
}

export default HomePage;
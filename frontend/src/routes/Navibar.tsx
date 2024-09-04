import { Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { setToken, userStore } from "../services/UserService";
import { useEffect, useState } from "react";

function Navibar() {
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => {
      setUserInfo(userStore.getState().token);
    });
    setUserInfo(userStore.getState().token);

    return () => unsubscribe();
  }, []);

  function logout() {
    userStore.dispatch(setToken(null));
    navigate("/");
  }

  return (
    <Navbar bg="dark" variant="dark">
      <Nav className="me-auto">
        <Link className="nav-link" to="/">Home</Link>

        {userInfo ? (
          <Nav.Link onClick={logout}>Logout</Nav.Link>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
      </Nav>
    </Navbar>
  );
}

export default Navibar;

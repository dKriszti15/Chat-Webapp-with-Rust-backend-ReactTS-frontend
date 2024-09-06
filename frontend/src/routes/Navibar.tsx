import { Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { setToken, userStore } from "../services/UserService";
import { useEffect, useState } from "react";
import { decode } from "jsonwebtoken";

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

  function getPrintableUsername(token: string): string {
    let user = decode(token) as {
      admin: boolean;
      username: string;
    };

    if (user == null) {
      return 'guest';
    }

    return user.username;
  }

  return (
    <Navbar>
      <Nav className="me-auto">
        <Link className="nav-link" to="/">Home</Link>
        {userInfo ? (
          <>
          <Nav.Link onClick={logout}>Logout</Nav.Link>
          <Link className="nav-link" to={`/my-chats/${getPrintableUsername(userInfo)}`}>My chats</Link>
          </>
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

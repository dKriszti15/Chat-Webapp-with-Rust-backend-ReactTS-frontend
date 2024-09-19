import { Button, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { setToken, userStore } from "../services/UserService";
import { useEffect, useState } from "react";
import { decode } from "jsonwebtoken";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import './Navibar.css';

function Navibar() {
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const defaultDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [theme, setTheme] = useState(defaultDark ? "dark" : "light");

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => {
      setUserInfo(userStore.getState().token);
    });
    setUserInfo(userStore.getState().token);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
  

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

  const switchTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    console.log(theme)
  };

  return (
    <Navbar bg={theme}>
        <Link className="nav-link" to="/">Home</Link>
        {userInfo ? (
          <>
          <Link className="nav-link" to={`/lobby/${getPrintableUsername(userInfo)}`}>Lobby</Link>
          <Nav.Link onClick={logout}>Logout</Nav.Link>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
        <Navbar.Text>
              <Button
                onClick={switchTheme}
                variant={theme === "dark" ? "light" : "dark"}
              >
                {theme === "dark" ? (
                  <FontAwesomeIcon
                    icon={faSun}
                    size="xl"
                    className="text-warning"
                  />
                ) : (
                  <FontAwesomeIcon icon={faMoon} size="xl" />
                )}
              </Button>
            </Navbar.Text>
    </Navbar>
  );
}

export default Navibar;

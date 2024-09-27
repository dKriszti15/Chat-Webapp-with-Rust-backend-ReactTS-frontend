import { faAt, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { setToken, userStore } from "../services/UserService";
import { decode } from "jsonwebtoken";

function LoginPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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

  async function tryLogin() {
    const loggingUser = {
      username: (document.getElementById("username") as HTMLInputElement).value,
      password: (document.getElementById("password") as HTMLInputElement).value,
    };

    try {
      const token = await login(loggingUser.username, loggingUser.password);

      if (token) {
        userStore.dispatch(setToken(token));
        navigate(`/lobby/${getPrintableUsername(token)}`);
      }
    } catch (err) {
      if (err === "User is already logged in") {
        setErrorMessage("This user is already logged in.");
      } else {
        setErrorMessage("Invalid username or password.");
      }
    }
  }

  return (
    <>
      <Container>
        {errorMessage && (
          <div className="alert alert-danger mb-3">{errorMessage}</div>
        )}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FontAwesomeIcon icon={faAt} size="xl" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            className="form-control"
            id="username"
            placeholder="Username"
            size="lg"
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FontAwesomeIcon icon={faKey} size="xl" />
          </InputGroup.Text>
          <Form.Control
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            size="lg"
          />
        </InputGroup>
        <div className="d-grid">
          <Button size="lg" onClick={tryLogin}>
            Login
          </Button>
        </div>
      </Container>
    </>
  );
}

export default LoginPage;

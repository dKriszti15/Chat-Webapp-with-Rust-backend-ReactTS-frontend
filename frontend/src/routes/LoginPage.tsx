import { faAt, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { setToken, userStore } from "../services/UserService";
import { decode } from "jsonwebtoken";

function LoginPage(){
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
    
  function tryLogin(){
      const loggingUser = {
        username: (document.getElementById("username") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value,
      }

      login(loggingUser.username, loggingUser.password)
        .then((token) => {
          userStore.dispatch(setToken(token));
          navigate(`/lobby/${getPrintableUsername(token)}`);
        })
        .catch((err) => setErrorMessage(err));
    }

    return(
        <>
        <Container >
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
    )
}

export default LoginPage;

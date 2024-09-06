import { faAt, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { register } from "../services/AuthService";
import { useState } from "react";
import { setToken, userStore } from "../services/UserService";


function RegisterPage(){
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();


    function tryRegister(){
      const userToInsert = {
        display_name: (document.getElementById("fullname") as HTMLInputElement).value,
        username: (document.getElementById("username") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value,
        password_again: (document.getElementById("password_again") as HTMLInputElement).value
      }

      register(userToInsert)
        .then((token) => {
          userStore.dispatch(setToken(token));
          navigate("/");
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
                id="fullname"
                placeholder="Full name"
                size="lg"
              />
            </InputGroup>
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
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faKey} size="xl" />
              </InputGroup.Text>
              <Form.Control
                type="password"
                className="form-control"
                id="password_again"
                placeholder="Password again"
                size="lg"
              />
            </InputGroup>
            <div className="d-grid">
              <Button size="lg" onClick={tryRegister}>
                Register
              </Button>
            </div>
        </Container>
        </>
    )
}


export default RegisterPage;
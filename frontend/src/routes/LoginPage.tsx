import { faAt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Form, InputGroup, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";


function LoginPage(){
    function tryLogin(){

    }

    return(
        <>
        <Navbar>
            <Link className="nav-link" to="/">Home</Link>
        </Navbar>
        <Container >
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
                <FontAwesomeIcon icon={faAt} size="xl" />
              </InputGroup.Text>
              <Form.Control
                type="text"
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
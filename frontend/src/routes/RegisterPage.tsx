import { faAt, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Form, InputGroup, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";


function RegisterPage(){
    function tryRegister(){

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
                id="firstname"
                placeholder="First name"
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
                id="lastname"
                placeholder="Last name"
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
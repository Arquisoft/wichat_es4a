import React, { useState, useContext } from "react";
import { Navbar, Nav, Container, Dropdown , Modal, Button} from "react-bootstrap";
import { VscAccount } from "react-icons/vsc";
import { GoSignOut } from "react-icons/go";
import i18n from "../i18n/i18next";
import { useTranslation } from "react-i18next";
import Rules from "./Rules"; 
import "./nav.css";
import { useNavigate } from 'react-router-dom';
import AuthContext from "./contextProviders/AuthContext";


const NavBar = () => {
  const { t } = useTranslation();

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <Navbar expand="lg" fixed="top" className="navbar-custom w-500">
        <Nav.Link onClick={() => navigate("/")} className="navbar-logo">
          <img src={"/images/logo.png"} alt="Logo" className="navbar-logo" />
        </Nav.Link>
        <Container>
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="dropdown-language"
                className="dropdown-language"
              >
                {t("language-menu")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => changeLanguage("es")}>
                  {t("spanish-menu")}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage("en")}>
                  {t("english-menu")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Link className="rules-menu" onClick={() => setShowRules(true)}>
              {t("rules-menu")}
            </Nav.Link>

            {/* Mostrar opciones según si hay un token en sessionStorage */}
            {token ? (
              <>
                <Nav.Link onClick={() => navigate("/user")} className="icon-menu"><VscAccount size={30} /></Nav.Link>
                <Nav.Link className="icon-menu" onClick={handleLogout}><GoSignOut size={30} /></Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link onClick={() => navigate("/login")} className="icon-menu">LogIn</Nav.Link>
                <Nav.Link onClick={() => navigate("/addUser")} className="icon-menu">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Rules show={showRules} handleClose={() => setShowRules(false)} />
        
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("logout-message")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("confirm-logout")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>{t("cancel-button")}</Button>
          <Button variant="danger" onClick={confirmLogout}>{t("confirm-button")}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavBar;



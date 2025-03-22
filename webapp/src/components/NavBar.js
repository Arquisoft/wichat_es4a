import React, { useState } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { VscAccount } from "react-icons/vsc";
import { GoSignOut } from "react-icons/go";
import i18n from "../i18n/i18next";
import { useTranslation } from "react-i18next";
import Rules from "./Rules"; 
import "./nav.css";


const NavBar = () => {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };


  const handleLogout = () => {
    sessionStorage.removeItem("token");  //Eliminar token de sessionStorage
    window.location.href = "/"; //Redirigir al home
  };

  return (
    <>
      <Navbar expand="lg" fixed="top" className="navbar-custom w-500">
        <Nav.Link href="/" className="navbar-logo">
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

            <Nav.Link href="#" className="rules-menu" onClick={() => setShowRules(true)}>
              {t("rules-menu")}
            </Nav.Link>

            {/* Mostrar opciones según si hay un token en sessionStorage */}
            {sessionStorage.getItem("token") != null ? (
              <>
                <Nav.Link href="/user" className="icon-menu"><VscAccount size={30} /></Nav.Link>
                <Nav.Link href="#" className="icon-menu" onClick={handleLogout}><GoSignOut size={30} /></Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link href="/login" className="icon-menu">LogIn</Nav.Link>
                <Nav.Link href="/addUser" className="icon-menu">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Rules show={showRules} handleClose={() => setShowRules(false)} />
    </>
  );
};

export default NavBar;



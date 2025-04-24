import React, { useState, useContext, useEffect } from "react";
import { Navbar, Nav, Container, Dropdown, Modal, Button } from "react-bootstrap";
import { VscAccount } from "react-icons/vsc";
import { GoSignOut } from "react-icons/go";
import i18n from "../i18n/i18next";
import { useTranslation } from "react-i18next";
import Rules from "./Rules";
import "./nav.css";
import { useNavigate } from 'react-router';
import AuthContext from "./contextProviders/AuthContext";

/**
 * Navigation bar component that is displayed at the top of the application.
 * 
 * Features:
 * - Displays a logo that navigates to the home page on click.
 * - Language switcher to toggle between supported languages.
 * - Navigation links including "Rules", "Login", "Sign Up", and user profile/logout options if logged in.
 * - Logout confirmation modal.
 * - Rules modal to display game instructions.
 * - Applies top padding to the body when required (to avoid overlapping content).
 *
 * @param {boolean} hasPadding - Determines whether top padding should be added to the body.
 * @returns {JSX.Element} Navigation bar with interactive language, auth, and help features.
 */

const NavBar = ({ hasPadding }) => {
  const { t } = useTranslation();

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Apply top padding when hasPadding is true to avoid overlapping the content
  useEffect(() => {
    if (hasPadding) {
      document.body.style.paddingTop = "56px";
    }
    return () => {
      document.body.style.paddingTop = "0";
    };
  }, [hasPadding]);

  // Handles language change
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Removes the token and redirects to home after confirming logout
  const confirmLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  // Opens logout confirmation modal
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <Navbar collapseOnSelect expand="lg" fixed="top" className="navbar-custom">
        <Container fluid className="navbar-inner-container">
          <Navbar.Brand onClick={() => navigate("/")} className="navbar-logo" style={{ cursor: 'pointer' }}>
            <img src={"/images/logo.png"} alt="Logo" className="navbar-logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center">
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

              {/* Conditional rendering based on user authentication */}
              {token ? (
                <>
                  <Nav.Link onClick={() => navigate("/user")} className="icon-menu" data-testid="user-icon">
                    <VscAccount size={30} />
                  </Nav.Link>
                  <Nav.Link className="icon-menu" onClick={handleLogout} data-testid="logout-icon">
                    <GoSignOut size={30} />
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link onClick={() => navigate("/login")} className="icon-menu">LogIn</Nav.Link>
                  <Nav.Link onClick={() => navigate("/addUser")} className="icon-menu">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
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

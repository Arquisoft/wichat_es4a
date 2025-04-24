import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./rules.css";

/**
 * Component that displays the game rules in a modal.
 *
 * This modal appears centered on the screen and lists the rules,
 * which are translated using the `react-i18next` library.
 * It can be closed either by clicking outside the modal or using the close button.
 *
 * @param {boolean} show - Determines whether the modal should be displayed.
 * @param {function} handleClose - Function to execute when closing the modal.
 * @returns {JSX.Element} Modal component displaying the game rules.
 */
const Rules = ({ show, handleClose }) => {
  const { t } = useTranslation(); // Hook for accessing translated strings

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="rules-modal">
      <Modal.Header closeButton className="close-icon-rules">
        <Modal.Title>{t("rules-title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t("rules-content-1")}</p>
        <p>{t("rules-content-2")}</p>
        <p>{t("rules-content-3")}</p>
        <p>{t("rules-content-4")}</p>
        <p>{t("rules-content-5")}</p>
        <p>{t("rules-content-6")}</p>
      </Modal.Body>
    </Modal>

  );
};

export default Rules;
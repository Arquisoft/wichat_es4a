import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import './home.css';
import Modal from "react-bootstrap/Modal";
import { useConfig } from '../contextProviders/GameConfigProvider';


/**
 * Component that renders a special "Chaos Mode" button.
 * When clicked, it opens a modal explaining the mode and offering to start the game in Chaos Mode.
 * In this mode, game settings such as topics, number of questions, and time per round are randomized.
 * 
 * Topics are shuffled, and a random subset is selected for gameplay.
 * Number of questions and time per round are chosen randomly from predefined options.
 * 
 * The game configuration is set via context and the user is redirected to the game screen.
 * 
 * @returns {JSX.Element} A button that opens a modal, allowing the user to start a game in Chaos Mode.
 */

export const ChaosButton = () => {
  const { setConfig } = useConfig();  // Access the game configuration context
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const { t } = useTranslation(); // Translation hook

   // Predefined lists for randomization
  const topicList = ["history", "entertainment", "art", "sport", "geography"];
  const questionOptions = [10, 20, 30];
  const timeOptions = [60, 120, 180];

  // Handlers to show/hide modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  /**
   * Function that generates random settings for Chaos Mode,
   * sets the configuration via context, and redirects to the game screen.
   */
  const handlePlayChaos = () => {
    const shuffledTopics = topicList.sort(() => 0.5 - Math.random());
    const randomTopics = shuffledTopics.slice(0, Math.floor(Math.random() * topicList.length) + 1);
    const randomQuestions = questionOptions[Math.floor(Math.random() * questionOptions.length)];
    const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];

    const chaosSettings = {
      questions: randomQuestions,
      timePerRound: randomTime,
      topics: randomTopics,
      isChaos: true
    };

    setConfig(chaosSettings);
    window.location.href = '/game'; // Redirect to game
  };

  return (
    <>
      <Button size="lg" className="chaos-button" onClick={handleShowModal}>
        {t("chaosMode-home")}
      </Button>

      {/* Chaos Mode introduction modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        animation={false}
        centered
        contentClassName="chaos-modal-content"
      >
        <Modal.Header className="text-center border-0">
          <button
            type="button"
            className="btn-close white position-absolute top-0 end-0 m-3"
            aria-label="Close"
            onClick={handleCloseModal}
          />
          <Modal.Title className="w-100 d-flex justify-content-between align-items-center px-4 py-3">
            <span role="img" aria-label="bomb">🔥💣</span>
            {t("chaosMode-intro-title")}
            <span role="img" aria-label="bomb">💣🔥</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <p>{t("chaosMode-intro-body")}</p>
          <p className="chaos-slogan">
            <span role="img" aria-label="random">🔀 </span>
            {t("chaosMode-slogan")}
          </p>
        </Modal.Body>

        <Modal.Footer className="justify-content-center border-0">
          <Button variant="danger" onClick={handlePlayChaos} className="chaos-btn">
            {t("playChaos")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

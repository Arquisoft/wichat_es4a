import React, { useState, useEffect } from "react";
import { Button, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import CloseButton from "react-bootstrap/CloseButton";
import { GoXCircle } from "react-icons/go";
import { useTranslation } from "react-i18next";
import "./configuration.css";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../contextProviders/GameConfigProvider";

const Configuration = ({ onClose }) => {

  // Constant to store the configuration of the game
  const { config, setConfig, resetConfig } = useConfig();

  const [questions, setQuestions] = useState(30);
  const [time, setTime] = useState(120);
  const { t } = useTranslation();
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [topics, setTopics] = useState([]);

  const topicList = ["history", "entertainment", "art", "sport", "geography"];

  const navigate = useNavigate();

  const handleClose = () => {
    resetConfig();
    onClose();
  };

  // Function to update the numberOfQuestionsSelected
  const handleQuestionsChange = (value) => {
    setQuestions(value);
    setConfig((prevConfig) => ({ ...prevConfig, questions: value }));
  };

  // Function to update the timePerRound
  const handleTimeChange = (value) => {
    setTime(value);
    setConfig((prevConfig) => ({ ...prevConfig, timePerRound: value }));
  };

  const handleButtonClick = (value) => {
    setSelectedButtons((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
    const topic = topicList[value - 1];

    // Adds or removes the topic from the list of topics
    const updatedTopics = selectedButtons.includes(value)
      ? topics.filter((item) => item !== topic) // If value is in topics, remove it
      : [...topics, topic]; // If value is not in topics, add it

    setTopics(updatedTopics);
    setConfig((prevConfig) => ({ ...prevConfig, topics: updatedTopics }));
  };

  const startGame = () => {
    navigate('/game', { state: { questionTime: time } })
  }

  /**
   * Effect to reset the configuration when the component is mounted
   */
  useEffect(() => {
    resetConfig();
  }, []);

  return (
    <div className="overlay">
      <div className="config-container">
        <CloseButton onClick={handleClose} className="close-icon" />
        <h2 className="title">{t("title-configuration")}</h2>
        <div className="config-option">
          <label>{t("numberQuestions-configuration")}</label>
          <Dropdown onSelect={(value) => handleQuestionsChange(Number(value))}>
            <Dropdown.Toggle variant="light">{questions}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey={10}>10</Dropdown.Item>
              <Dropdown.Item eventKey={20}>20</Dropdown.Item>
              <Dropdown.Item eventKey={30}>30</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="config-option">
          <label>{t("time-configuration")}</label>
          <Dropdown onSelect={(value) => handleTimeChange(Number(value))}>
            <Dropdown.Toggle variant="light">{time}s</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey={60}>60s</Dropdown.Item>
              <Dropdown.Item eventKey={120}>120s</Dropdown.Item>
              <Dropdown.Item eventKey={180}>180s</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="topics-section">
          <label className="topics-label">Topics</label>

          <ToggleButtonGroup
            type="checkbox"
            className="buttonGroup"
          >
            <div className="first-row">
              <ToggleButton
                id="history"
                value={1}
                className={`toggle-btn-history ${selectedButtons.includes(1) ? "selected" : ""}`}
                onClick={() => handleButtonClick(1)}
              >
                {t("history-configuration")}
              </ToggleButton>
              <ToggleButton
                id="entertainment"
                value={2}
                className={`toggle-btn-science ${selectedButtons.includes(2) ? "selected" : ""}`}
                onClick={() => handleButtonClick(2)}
              >
                {t("entertainment-configuration")}
              </ToggleButton>
              <ToggleButton
                id="art"
                value={3}
                className={`toggle-btn-art ${selectedButtons.includes(3) ? "selected" : ""}`}
                onClick={() => handleButtonClick(3)}
              >
                {t("art-configuration")}
              </ToggleButton>
            </div>
            <div className="second-row">
              <ToggleButton
                id="sport"
                value={4}
                className={`toggle-btn-sport ${selectedButtons.includes(4) ? "selected" : ""}`}
                onClick={() => handleButtonClick(4)}
              >
                {t("sport-configuration")}
              </ToggleButton>
              <ToggleButton
                id="geography"
                value={5}
                className={`toggle-btn-geography ${selectedButtons.includes(5) ? "selected" : ""}`}
                onClick={() => handleButtonClick(5)}
              >
                {t("geography-configuration")}
              </ToggleButton>
            </div>
          </ToggleButtonGroup>
        </div>
        <Button disabled={topics.length === 0} className="play-button" onClick={() => startGame()}>{t("play-configuration")}</Button>
      </div>
    </div>
  );
};

export default Configuration;

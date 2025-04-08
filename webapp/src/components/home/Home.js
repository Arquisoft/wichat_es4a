import React, { useState, useEffect, useContext  } from "react";
import Button from "react-bootstrap/Button";
import Configuration from "./Configuration";
import { useTranslation } from "react-i18next";
import NavBar from "../NavBar";
import { GameConfigProvider } from '../contextProviders/GameConfigProvider';
import AuthContext from '../contextProviders/AuthContext.js';
import { welcome } from '../../services/LLMService';
import { Typewriter } from "react-simple-typewriter";
import './home.css';

export const Home = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const { t, i18n } = useTranslation();
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    /**
     * Fetches a greeting message for the user based on their name and language.
     * 
     * @async
     * @function fetchGreeting
     * @throws Will throw an error if the greeting could not be fetched.
     * 
     * @example
     * fetchGreeting();
     */
    const fetchGreeting = async () => {
      try {
        const response = await welcome({ username: user?.username || "", language: i18n.language.split('-')[0] });
        setGreeting(response.data.answer);
      } catch (error) {
        console.error("Error al obtener saludo:", error);
        setGreeting(t("hello-home"));
      }
    };

    fetchGreeting();
  }, [i18n.language, t]); // Esto se vuelve a ejecutar cada vez que cambia el idioma


  return (
    <div className="home-container">
      {/* NavBar */}
      <NavBar />

      {/* Contenido Principal */}
      <h1 className="home-heading">
        {t("welcome-home")} <span className="app-name">WiChat</span>
      </h1>
      {greeting !== null && (
        <p className="home-subheading">
          <Typewriter
            key={`typewriter-${greeting}`}
            words={[greeting, "~ Powered By ~", "👩 Claudia, 👨 Javier, 👩 Adriana, 👩 Ana, 👩 Andrea, 👨 Aitor"]}
            cursor
            cursorStyle="|"
            typeSpeed={50}
          />
        </p>
      )}
      <div className="home-buttons">
        <Button size="lg" className="game-options" onClick={() => setShowConfig(true)}>
          {t("quickGame-home")}
        </Button>
        <Button size="lg" className="game-options" onClick={() => setShowConfig(true)}>
          {t("chaosMode-home")}
        </Button>
      </div>

      {showConfig &&
        <GameConfigProvider key={Date.now()}> {/* Key to force re-render and configurate again */}
          <Configuration onClose={() => setShowConfig(false)} />
        </GameConfigProvider>
      }
    </div>
  );
};
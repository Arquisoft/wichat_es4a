import React, { useState, useEffect, useContext  } from "react";
import Button from "react-bootstrap/Button";
import Configuration from "./Configuration";
import { useTranslation } from "react-i18next";
import NavBar from "../NavBar";
import { ChaosButton } from "./ChaosMode";
import { GameConfigProvider } from '../contextProviders/GameConfigProvider';
import AuthContext from '../contextProviders/AuthContext.js';
import { welcome } from '../../services/LLMService';
import { Typewriter } from "react-simple-typewriter";
import './home.css';

/**
 * Home component that serves as the landing page of the application.
 * 
 * Features:
 * - Displays a welcome message and the app name.
 * - Offers two main gameplay options:
 *    - Quick Game: Opens a configuration panel to customize the game.
 *    - Chaos Mode: Launches a randomized game setup.
 * - Includes the navigation bar for site-wide access.
 * 
 * Configuration modal is conditionally rendered based on the state.
 * Each button is wrapped with the `GameConfigProvider` to supply game settings context.
 *
 * @returns {JSX.Element} Home screen with navigation and game options.
 */

export const Home = () => {
  const [showConfig, setShowConfig] = useState(false); // Controls visibility of configuration panel
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
      <NavBar />
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
        <GameConfigProvider>
          <ChaosButton />
        </GameConfigProvider>
      </div>

      {showConfig &&
        <GameConfigProvider>
          <Configuration onClose={() => setShowConfig(false)} />
        </GameConfigProvider>
      }
    </div>
  );
};

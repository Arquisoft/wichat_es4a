import React, { useState, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import "bootstrap/dist/css/bootstrap.min.css";

import { ResultSectorChart } from './ResultSectorChart';
import { QuestionAccordion } from "../gameHistory/QuestionAccordion";
import { useLocation, useNavigate } from 'react-router';
import { GameConfigProvider } from '../contextProviders/GameConfigProvider';
import Configuration from '../home/Configuration';
import { use } from "i18next";


/**
 * 
 * @param {Array} questions - The array of questions with the topic, imageUrl and answers.
 * @param {Int} points - The points obtained in the game.
 * @param {Int} numOfCorrectAnswers - The number of correct answers.
 * @param {Int} numOfWrongAnswers - The number of wrong answers.
 * @param {Int} numOfNotAnswered - The number of not answered questions. 
 * @returns 
 */
export const GameResults = () => {

    const { t } = useTranslation();
    const storedResults = JSON.parse(localStorage.getItem("gameResults"));
    const navigate = useNavigate();
    const [showConfig, setShowConfig] = useState(false);

    const { questions, points, numOfCorrectAnswers, numOfWrongAnswers, numOfNotAnswered } = storedResults;

    if (!storedResults) return <p>No game data</p>;

    return (
        <Container fluid className="game-results-container">
            <Row className="justify-content-md-center text-center">
                <Col lg={5} xs={5} className="d-flex justify-content-center align-items-center">
                    <h2 className="finalPoints">{points}pts</h2>
                </Col>
                <Col lg={6} xs={6} className="d-flex align-items-center">
                    <h2 className="game-details-title">{t("game-details-text")}</h2>
                </Col>
            </Row>
            <Row className="d-flex justify-content-md-center align-items-center">
                <Col lg={5}>
                    <ResultSectorChart
                        correctAnswers={numOfCorrectAnswers}
                        wrongAnswers={numOfWrongAnswers}
                        notAnswered={numOfNotAnswered}
                    />
                </Col>
                <Col lg={6} xs={6} >
                    <div className="game-details">
                        <QuestionAccordion questions={questions} />
                    </div>
                </Col>
            </Row>
            <Row className="justify-content-md-center">
                <Col lg={2} xs={4} className="d-flex gap-2">
                    <Button
                        className="game-results-button"
                        variant="primary"
                        onClick={() => {
                            if (storedResults.isChaosMode) {
                                navigate('/game'); 
                            } else {
                                setShowConfig(true); 
                            }
                        }}
                    >
                        {t('play-again-button-text')}
                    </Button>

                    <Button className="game-results-button" variant="primary" onClick={() => navigate('/')}>{t('go-back-to-menu')}</Button>
                </Col>
            </Row>

            {showConfig &&
                <GameConfigProvider key={Date.now()}> {/* Key to force re-render and configurate again */}
                    <Configuration onClose={() => setShowConfig(false)} />
                </GameConfigProvider>
            }
        </Container>


    );
}
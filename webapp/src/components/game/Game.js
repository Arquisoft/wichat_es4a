import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerButton from './AnswerButton';
import Timer from './Timer';
import LLMChat from './LLMChat';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router';
import './game.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { getNextQuestion, saveGame, configureGame } from '../../services/GameService';
import { useConfig } from '../contextProviders/GameConfigProvider';
import { use } from 'react';
import AuthContext from '../contextProviders/AuthContext';


/**
 * React component that represents a wichat game with his timer, question, image, 
 * answers and chat with the LLM to ask for clues.
 * 
 * @returns the hole game screen with the timer, question, image, answers and chat with the LLM.
 */
export const Game = () => {

    // Game configuration
    const { config } = useConfig();
    const isChaosMode = config.isChaos || false;
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);


    const questionTime = config.timePerRound; // Get the question time from the configuration
    const numberOfQuestions = config.questions; // Get the number of questions from tge configuration
    const topics = config.topics; // Get the topics from the configuration

    // State that stores the answers of the current question with the text and if it is the correct answer
    const [answers, setAnswers] = useState([]);
    // State that stores the current question with the text, image and topic
    const [question, setQuestion] = useState({});
    const [points, setPoints] = useState(0);
    const [gameKey, setGameKey] = useState(0);
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [notAnswered, setNotAnswered] = useState(0);
    const [exitIcon, setExitIcon] = useState("/exit-icon.png");
    const [showModal, setShowModal] = useState(false);
    const [stopTimer, setStopTimer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // State that stores the results of the questions with json format
    // with attributes: topic, imageUrl, wasUserCorrect, selectedAnswer (text of the answer selected) 
    // and answers (an array of objects with text and isCorrect)
    const [questionResults, setQuestionResults] = useState([]);
    const [numberOfQuestionsAnswered, setNumberOfQuestionsAnswered] = useState(0);
    // State that stores if the user requested to exit the game. It is used to avoid errors that happen when the user
    // tries to exit the game while other actions are being performed in the background.
    const [exitRequested, setExitRequested] = useState(false);
    const [blockButtons, setBlockButtons] = useState(false);

    // Function that will be called when the timer reaches 0
    const onTimeUp = () => {
        setBlockButtons(true);
        setNotAnswered(notAnswered + 1);
        addQuestionResult(false, null);
        setTimeout(() => askForNextQuestion(), 1000); // Wait 1 second before showing the next question
    }

    //This useEffect will be triggered when the questionResults state changes. 
    //It will check if the number of questions answered is equal to the number of questions and if so, 
    // it will save the results in the local storage and navigate to the results screen.
    useEffect(() => {
        if (numberOfQuestionsAnswered === numberOfQuestions) {
            localStorage.setItem("gameResults", JSON.stringify({
                questions: questionResults,
                points,
                numOfCorrectAnswers: correctAnswers,
                numOfWrongAnswers: wrongAnswers,
                numOfNotAnswered: notAnswered,
                isChaosMode: isChaosMode
            }));

            const valor = isChaosMode ? "caos" : "normal";

            // If there's a user authenticated, the game will be saved in the database
            if (token) {
                saveGame(token, questionResults, numberOfQuestions, correctAnswers, valor, points)
                    .catch(err => {
                        console.error("Error saving game:", err)
                    })
                    .finally(() => {
                        setTimeout(() => {
                            navigate('/game/results');
                        }, 1000); // Espera 1 segundo antes de navegar
                    });
            }
            // If there's no user authenticated, the game will not be saved in the database
            else {
                setTimeout(() => {
                    navigate('/game/results');
                }, 1000); // Espera 1 segundo antes de navegar
            }

        }
    }, [questionResults]);

    const askForNextQuestion = async () => {
        prepareUIForNextQuestion();

        if (numberOfQuestionsAnswered === numberOfQuestions) {
            return;
        }
        setNumberOfQuestionsAnswered(numberOfQuestionsAnswered + 1);

        getNextQuestion().then((questionInfo) => {
            setQuestion(questionInfo.question);
            setAnswers(questionInfo.answers);
            setStopTimer(false);
            setBlockButtons(false);
            setIsLoading(false);
        }
        );
    }

    // UseEffect to send the information to configure the game and ask for the first question
    useEffect(() => {
        const run = async () => {
            await configureGame(topics, i18n.language.split('-')[0]);
            askForNextQuestion();
        };
        run();
    }, []); // Empty dependency array means this effect runs only once on mount

    /**
     * Handles the popstate event to prevent the user from navigating back
     */
    useEffect(() => {
        const handlePopState = (event) => {
            handleBeforeNavigate(event);
        };

        // Hears the popstate event to detect history changes
        window.addEventListener('popstate', handlePopState);

        // Update the history state to prevent the user from navigating back
        window.history.pushState(null, document.title);

        return () => {
            // Clean up the event listener when the component is unmounted
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    /**
     * Function that handles the beforenavigate event to show the confirmation dialog when the user tries to leave the page
     */
    const handleBeforeNavigate = (event) => {
        event.preventDefault(); // Prevents the user from navigating back
        setShowModal(true); // Shows the confirmation dialog
    };

    /**
     * Adds an event listener to the beforeunload event to show the confirmation dialog when the user tries to leave or reload the page
     */
    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Clean up the event listener when the component is unmounted
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    // Handles the beforeunload event to show the confirmation dialog when the user tries to leave the page
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = '';  // Shows the confirmation dialog
    };

    /**
     * Function that handles the user answer to the question.
     * 
     * @param {boolean} wasUserCorrect - True if the user was correct, false otherwise.
     */
    const answerQuestion = (wasUserCorrect, selectedAnswer) => {
        setBlockButtons(true);
        if (wasUserCorrect) {
            addPoints(100);
            setCorrectAnswers(correctAnswers + 1);
        } else {
            if (isChaosMode) {
                addPoints(-50);
            }
            setWrongAnswers(wrongAnswers + 1);
        }
        addQuestionResult(wasUserCorrect, selectedAnswer);

        setStopTimer(true);

        setTimeout(() => {
            askForNextQuestion()
        }, 2000); // Wait 2 second before showing the next question

    }

    /**
     * Function that adds the result of the question to the questionResults state.
     * 
     * @param {boolean} wasUserCorrect - True if the user was correct, false otherwise.
     */
    const addQuestionResult = (wasUserCorrect, selectedAnswer) => {
        setQuestionResults([...questionResults, {
            "text": question.text,
            "imageUrl": question.imageUrl,
            "wasUserCorrect": wasUserCorrect,
            "selectedAnswer": selectedAnswer,
            "answers": answers.map(answer => ({ "text": answer.text, "isCorrect": answer.isCorrect }))
        }]);
    }

    /**
     * Function that adds points to the user and animates the points to add.
     * 
     * @param {Number} pointsToAdd 
     */
    const addPoints = (pointsToAdd) => {
        setPointsToAdd(pointsToAdd);
        setPoints(points + pointsToAdd);
        setTimeout(() => setPointsToAdd(0), 1000); // Remove points to add animation after 1 second
    }

    const passQuestion = () => {
        setBlockButtons(true);
        setNotAnswered(notAnswered + 1);
        addQuestionResult(false, null);
        setTimeout(() => askForNextQuestion(), 1000); // Wait 1 second before showing the next question
    }

    /**
     * Function that prepares the UI for the next question resetting the timer and the answer buttons.
     */
    const prepareUIForNextQuestion = () => {
        setBlockButtons(true);
        setGameKey(gameKey + 1);
        setIsLoading(true);
        setQuestion({ text: t('question-generation-message'), imageUrl: "" });
        setAnswers([{ text: "...", isCorrect: false }, { text: "...", isCorrect: false }, { text: "...", isCorrect: false }, { text: "...", isCorrect: false }]);
        setStopTimer(true);
    }

    /**
     * Function that asks the user if he really wants to exit the game.
     */
    const askExitGame = () => {
        setShowModal(true);
    }

    /**
     * Function that handles the close of the modal
     */
    const handleCloseModal = () => {
        setShowModal(false);
    };

    /**
     * Function that exits the game without saving the progress.
     */
    const exitFromGame = () => {
        if (!isLoading)
            navigate('/');
        else
            setExitRequested(true);
    }

    useEffect(() => {
        if (exitRequested && !isLoading) {
            navigate('/');
        }
    }, [exitRequested, isLoading]);

    /**
     * Finds the correct answer from a list of answers.
     * @param {Array} answers - The array of answer objects.
     * @param {boolean} answers[].isCorrect - Indicates if the answer is correct.
     * @param {string} answers[].text - The text of the answer.
     * @returns {string} The text of the correct answer, or an empty string if no correct answer is found.
     */
    const correctAnswer = answers.find(answer => answer.isCorrect)?.text || '';

    return (
        <div className={isChaosMode ? 'chaos-mode' : ''}>
            <main className='game-screen' key={gameKey}>
                <div className='timer-div'>
                    <Timer initialTime={questionTime} onTimeUp={onTimeUp} stopTime={stopTimer} />
                </div>
                <div className='game-questions-answered'>
                    <p className="question-number">{numberOfQuestionsAnswered}/{numberOfQuestions}</p>
                </div>
                <div className='game-points-and-exit-div'>
                    {pointsToAdd > 0 && <div className='points-to-add'>+{pointsToAdd}</div>}
                    {pointsToAdd < 0 && isChaosMode && <div className='points-to-remove'>{pointsToAdd}</div>}
                    <div data-testid="gamePoints" className={points < 1000 ? 'points-div-under-1000' : 'points-div-above-1000'}>{points}pts</div>
                    <button
                        onClick={askExitGame}
                        className="exit-button"
                        onMouseEnter={() => setExitIcon("/red-exit-icon.png")}
                        onMouseLeave={() => setExitIcon("/exit-icon.png")}
                    >
                        <img src={exitIcon} className='exit-icon' alt='exit-button' />
                    </button>
                </div>
                <div className='game-question'>
                    <p className={question.text === "Generando Pregunta..." ? 'question-loading' : ''}>{question.text}</p>
                </div>
                <div className='div-question-img'>
                    {isLoading ? <Spinner animation="border" /> : <img className="question-img" src={question.imageUrl} />}
                </div>
                <section id="question-answers-section">
                    <div id="game-answer-buttons-section">
                        { /* Create the answerButtons */}
                        { /* Uses key to help React renderizing */}
                        {answers.map((answer, index) => (
                            <AnswerButton
                                key={index}
                                answerText={answer.text}
                                isCorrectAnswer={answer.isCorrect}
                                answerAction={answerQuestion}
                                isDisabled={blockButtons}
                            />
                        ))}
                    </div>
                </section>
                <aside className='llm-chat-aside'>
                    <LLMChat name={correctAnswer} />
                </aside>
                <div className="pass-button-div">
                    <Button className="pass-button" onClick={passQuestion} disabled={blockButtons} >
                        {t('pass-button-text')}
                    </Button>
                </div>

                <Modal show={showModal} onHide={handleCloseModal} animation={false} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('exit-confirm-msg-title')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{t('exit-confirm-msg-body')}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            {t('exit-confirm-msg-close')}
                        </Button>
                        <Button variant="danger" onClick={exitFromGame}>
                            {t('exit-confirm-msg-exit')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </main>
        </div>
    );
}    

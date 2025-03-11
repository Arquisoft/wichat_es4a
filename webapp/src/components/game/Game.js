import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerButton from './AnswerButton';
import Timer from './Timer';
import LLMChat from './LLMChat';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './game.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { getNextQuestion } from '../../services/GameService';


/**
 * React component that represents a wichat game with his timer, question, image, 
 * answers and chat with the LLM to ask for clues.
 * 
 * @param {Number} questionTime - The initial time in seconds to answer the question.
 * @param {Array} answers - The array of answers with the text and if it is the correct answer.
 * @returns the hole game screen with the timer, question, image, answers and chat with the LLM.
 */
export const Game = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const questionTime = location.state?.questionTime || 120; // Get the question time from the location state or set it to 120 seconds by default

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

    const onTimeUp = () => {
        blockAnswerButtons();
        setNotAnswered(notAnswered + 1);
        addQuestionResult(false, null);
        setTimeout(() => askForNextQuestion(), 1000); // Wait 1 second before showing the next question
    }

    const askForNextQuestion = () => {
        prepareUIForNextQuestion();

        getNextQuestion().then((questionInfo) => {
            setIsLoading(false);
            setQuestion(questionInfo.question);
            setAnswers(questionInfo.answers);
            setStopTimer(false);
            unblockAnswerButtons();
        }
        );
        
    }

    // UseEffect to call getNextQuestion on initial render
    useEffect(() => {
        askForNextQuestion();
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
        blockAnswerButtons();
        if (wasUserCorrect) {
            addPoints(100);
            setCorrectAnswers(correctAnswers + 1);
        }
        else {
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
            "topic": question.topic,
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
        blockAnswerButtons()
        setNotAnswered(notAnswered + 1);
        addQuestionResult(false, null);
        setTimeout(() => askForNextQuestion(), 1000); // Wait 1 second before showing the next question
    }

    /**
     * Function that prepares the UI for the next question resetting the timer and the answer buttons.
     */
    const prepareUIForNextQuestion = () => {
        setGameKey(gameKey + 1);
        setIsLoading(true);
        setQuestion({text: t('question-generation-message'), image: ""});
        setAnswers([{text: "...", isCorrect: false}, {text: "...", isCorrect: false}, {text: "...", isCorrect: false}, {text: "...", isCorrect: false}]);
        setStopTimer(true);
    }

    const blockAnswerButtons = () => {
        document.querySelectorAll("[class^='answer-button-']").forEach(button => button.disabled = true);
        document.querySelector(".pass-button").disabled = true;
    }

    const unblockAnswerButtons = () => {
        document.querySelectorAll("[class^='answer-button-']").forEach(button => button.disabled = false);
        document.querySelector(".pass-button").disabled = false;
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
        navigate('/');
    }

    /**
     * Finds the correct answer from a list of answers.
     * @param {Array} answers - The array of answer objects.
     * @param {boolean} answers[].isCorrect - Indicates if the answer is correct.
     * @param {string} answers[].text - The text of the answer.
     * @returns {string} The text of the correct answer, or an empty string if no correct answer is found.
     */
    const correctAnswer = answers.find(answer => answer.isCorrect)?.text || '';

    return (
        <main className='game-screen' key={gameKey}>
            <div className='timer-div'>
                <Timer initialTime={questionTime} onTimeUp={onTimeUp} stopTime={stopTimer} />
            </div>
            <div className='game-points-and-exit-div'>
                {pointsToAdd > 0 && <div className='points-to-add'>+{pointsToAdd}</div>}
                <div className={points < 1000 ? 'points-div-under-1000' : 'points-div-above-1000'}>{points}pts</div>
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
                <p className={question.text === t('question-generation-message') ? 'question-loading' : ''}>{question.text}</p>
            </div>
            <div className='div-question-img'>
                {isLoading ? <Spinner animation="border" /> : <img className="question-img" src={question.image} />}
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
                        />
                    ))}

                </div>
            </section>
            <aside className='llm-chat-aside'>
                <LLMChat name={correctAnswer} />
            </aside>
            <div className="pass-button-div">
                <button className="pass-button" onClick={passQuestion}>{t('pass-button-text')}</button>
            </div>
            {/* Modal to ask the user if he really wants to exit the game */}
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
    )
}

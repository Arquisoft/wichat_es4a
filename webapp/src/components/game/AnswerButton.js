import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

/**
 * React component to represent an answer in the game that can be wrong or correct.
 * @param {String} answerText - The text of the answer.
 * @param {Boolean} isCorrectAnswer - A flag to indicate if the answer is correct or not.
 * @param {Function} answerAction - The function to execute when the answer is clicked.
 * @param {Boolean} isDisabled - A flag to indicate if the button is disabled or not.
 * 
 * @returns A button with the answer text that changes its style when it is clicked.
 */
const AnswerButton = ({answerText, isCorrectAnswer, answerAction, isDisabled}) => {

    const [wasSelected, setWasSelected] = useState(false);

    const buttonClassName = wasSelected ?
        (isCorrectAnswer ? "answer-button-correct-answer" : "answer-button-wrong-answer")
        : "answer-button-not-answered";

    const handleClick = () => {
        answerAction(isCorrectAnswer, answerText);
        setWasSelected(true);
    }

    return (
        <Button onClick={handleClick} className={buttonClassName} variant="none" disabled={isDisabled}>
            <div className="answer-button-content">
            {answerText}
            {wasSelected && (
                <img 
                    src={isCorrectAnswer ? "/correct-icon.png" : "/wrong-icon.png"} 
                    alt={isCorrectAnswer ? "Correct" : "Incorrect"} 
                    className="answer-icon"
                />
            )}
            </div>
        </Button>
    )
}

export default AnswerButton;
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Accordion from 'react-bootstrap/Accordion';
import QuestionImage from '../game/QuestionImage';
import '../game/game.css';

/** 
 * This component represents each of the questions displayed in the history or summary of a game.
 * Each question has a topic, an image, and a list of answers.
 */
export const QuestionAccordion = ({ questions }) => {
    return (
        <Accordion>
            {questions.map((question, index) => {
                const wasSkipped = question.selectedAnswer === null;

                return (
                    <Accordion.Item eventKey={index.toString()} key={index}>
                        <Accordion.Header>{index + 1}. {question.text}</Accordion.Header>
                        <Accordion.Body>
                            <QuestionImage
                                src={question.imageUrl}
                                alt={question.text}
                                rounded
                                className="history-img"
                            />
                            {question.answers.map((answer, i) => {
                                let symbol = '';
                                let color = 'black';

                                if (wasSkipped) {
                                    symbol = answer.isCorrect ? '✔' : '❓';
                                    color = answer.isCorrect ? 'green' : 'gray';
                                } else if (answer.text === question.selectedAnswer && answer.isCorrect) {
                                    symbol = '✔';  // Seleccionó la correcta
                                    color = 'green';
                                } else if (answer.text === question.selectedAnswer && !answer.isCorrect) {
                                    symbol = '❌';  // Seleccionó una incorrecta
                                    color = 'red';
                                } else if (answer.isCorrect) {
                                    symbol = '✔';  // Muestra la correcta cuando se falla
                                    color = 'green';
                                }

                                return (
                                    <p key={i} style={{ color }}>
                                        {answer.text} {symbol}
                                    </p>
                                );
                            })}
                        </Accordion.Body>
                    </Accordion.Item>
                );
            })}
        </Accordion>
    );
};


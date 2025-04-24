import React from "react";
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Game } from './Game';
import AuthContext from '../contextProviders/AuthContext';
import ConfigContext from '../contextProviders/GameConfigProvider';
import i18n from 'i18next';
import { MemoryRouter } from "react-router";
import { configureGame, getNextQuestion, saveGame } from '../../services/GameService';
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

const question = "What is the name of this country?";
const imageUrl = "http://example.com/image.png";
const answers = [
    { text: "Spain", isCorrect: true },
    { text: "England", isCorrect: false },
    { text: "Germany", isCorrect: false },
    { text: "Portugal", isCorrect: false }
];

// Mock of gameservice module
jest.mock('../../services/GameService')

// It makes the import of the AuthContext to be mocked so it's not the real one
// and it uses te mock one instead
jest.mock('../contextProviders/AuthContext', () => {
    const React = require('react');
    const AuthContext = React.createContext({});
    return {
        __esModule: true,
        default: AuthContext,
    };
});

const defaultConfig = { questions: 30, timePerRound: 120, topics: ["geography"] };

const renderComponent = () => {
    render(
        <AuthContext.Provider value={{}}>
            <MemoryRouter>
                <ConfigContext.Provider value={{
                    config: defaultConfig,
                    setConfig: jest.fn(),
                    resetConfig: jest.fn()
                }}>
                    <Game />
                </ConfigContext.Provider>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

/**
 * Function that mocks the game service to return a sequence of questions
 * 
 * @param {Object} questions with the following structure:
 * {
 *  text: "What is the capital of Spain?",
 *  imageUrl: "http://example.com/image.png",
 *  answers: [
 *  { text: "Madrid", isCorrect: true },
 *  { text: "Barcelona", isCorrect: false },
 *  { text: "Valencia", isCorrect: false },
 *  { text: "Sevilla", isCorrect: false }
 * ]
 */
const mockGameServiceSequence = (questions) => {
    configureGame.mockImplementation(() => {
        return Promise.resolve({ cacheId: "12345" });
    });

    questions.forEach((q) => {
        getNextQuestion.mockImplementationOnce(() => {
            return Promise.resolve({
                question: {
                    text: q.text,
                    imageUrl: q.imageUrl
                },
                answers: q.answers
            });
        })
    });
};

/**
 * Function that mocks a single question
 * 
 * @param {String} questionText the text of the question
 * @param {String} imageUrl the URL of the image
 * @param {Array} answers the array of posible answers
 */
const mockGameService = ({ questionText, imageUrl, answers }) => {
    configureGame.mockImplementation(() => {
        return Promise.resolve({ cacheId: "12345" });
    });

    getNextQuestion.mockImplementation(() => {
        return Promise.resolve({
            question: {
                text: questionText,
                imageUrl: imageUrl
            },
            answers: answers
        });
    });
};

describe('Some game interactions', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        configureGame.mockReset();
        getNextQuestion.mockReset();
        saveGame.mockReset();
    });


    it('should call configureGame and getNextQuestion when the component is mounted', async () => {
        mockGameService({
            questionText: question,
            imageUrl: imageUrl,
            answers: answers
        });
        renderComponent();

        // We wait for the new question and the answers to be displayed
        await waitFor(() => {
            expect(configureGame).toHaveBeenCalled();
            expect(getNextQuestion).toHaveBeenCalled();

            expect(screen.getByText(question)).toBeInTheDocument();
            answers.forEach(answer => {
                expect(screen.getByText(answer.text)).toBeInTheDocument();
            });
        });
    });

    it('should show the button in green and the points has to be greater than 0 when a correct answer is selected', async () => {
        mockGameService({
            questionText: question,
            imageUrl: imageUrl,
            answers: answers
        });
        renderComponent();
        // We wait for the new question and the answers to be displayed
        await waitFor(() => {
            expect(screen.getByText(question)).toBeInTheDocument();
            answers.forEach(answer => {
                expect(screen.getByText(answer.text)).toBeInTheDocument();
            });
        });

        // Selecting a correct answer
        const answerButton = screen.getByRole('button', { name: answers[0].text })
        await act(async () => {
            await userEvent.click(answerButton);
        });

        // Check if points are greater than 0
        const points = screen.getByTestId("gamePoints").textContent;
        const pointsValue = parseInt(points.match(/\d+/)[0], 10)
        expect(pointsValue).toBeGreaterThan(0);
        // Check if the button has correct answer class
        expect(answerButton).toHaveClass("answer-button-correct-answer");
    });

    it('should show the button in red and the points has to be 0 when a wrong answer is selected', async () => {
        mockGameService({
            questionText: question,
            imageUrl: imageUrl,
            answers: answers
        });
        renderComponent();
        // We wait for the new question and the answers to be displayed
        await waitFor(() => {
            expect(screen.getByText(question)).toBeInTheDocument();
            answers.forEach(answer => {
                expect(screen.getByText(answer.text)).toBeInTheDocument();
            });
        });
        // Selecting a wrong answer
        const answerButton = screen.getByRole('button', { name: answers[1].text })
        await act(async () => {
            await userEvent.click(answerButton);
        });
        // Check if points are equal to 0
        const points = screen.getByTestId("gamePoints").textContent;
        const pointsValue = parseInt(points.match(/\d+/)[0], 10)
        expect(pointsValue).toBe(0);
        // Check if the button has correct answer class
        expect(answerButton).toHaveClass("answer-button-wrong-answer");
    });

    it('should call getNextQuestion when the user answers a question', async () => {
        const question2 = "What is the name of this videogame?";
        const answers2 = [
            { text: "Outer Wilds", isCorrect: true },
            { text: "Minecraft", isCorrect: false },
            { text: "Fifa", isCorrect: false },
            { text: "CoD", isCorrect: false }
        ]

        mockGameServiceSequence([
            { text: question, imageUrl: imageUrl, answers: answers },
            { text: question2, imageUrl: imageUrl, answers: answers2 }
        ])

        // Use fake timers to control the time and avoid fails for timeouts
        jest.useFakeTimers();

        renderComponent();
        // We wait for the new question and the answers to be displayed
        await waitFor(() => {
            expect(getNextQuestion).toHaveBeenCalledTimes(1);
            expect(screen.getByText(question)).toBeInTheDocument();
            answers.forEach(answer => {
                expect(screen.getByText(answer.text)).toBeInTheDocument();
            });
        });

        const answerButton = screen.getByRole('button', { name: answers[0].text })

        // Selects an answer
        await act(async () => {
            userEvent.click(answerButton);
        });

        // We wait for the new question and the answers to be displayed
        await waitFor(async () => {
            expect(getNextQuestion).toHaveBeenCalledTimes(2);
            expect(screen.getByText(question2)).toBeInTheDocument();
            answers2.forEach(answer => {
                expect(screen.getByText(answer.text)).toBeInTheDocument();
            });
        }, { timeout: 3000 });
    });
});
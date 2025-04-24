import React from "react";
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LLMChat from './LLMChat';
import i18n from 'i18next';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const llmResponse = "Hello there! This is a message from the development team, pls give us some donations";
const mockAxios = new MockAdapter(axios);

const renderComponent = () => {
    render(
        <LLMChat name="llmtest" />
    );
}

const sendMessage = async (message) => {
    const input = screen.getByPlaceholderText(i18n.t('llm-chat-placeholder'));
    const sendButton = screen.getByTestId('chatSubmitButton');

    // Simulate user typing a message
    await act(async () => {
        await userEvent.type(input, message);
        await userEvent.click(sendButton);
    });
}

describe('LLMChat component interaction', () => {

    beforeEach(() => {
        mockAxios.reset();
    });

    it('should send a message and receive a response', async () => {
        renderComponent();

        // Simulates the axios post request to the LLM service
        mockAxios.onPost('http://localhost:8000/askllm/clue').reply(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([200, { answer: llmResponse }]);
                }, 2000);  // Simulates a delay of 2 seconds for the loading message to appear
            });
        });

        const userMsg = 'Hello LLM';

        await sendMessage(userMsg);

        // Check if the user's message is displayed
        expect(screen.getByText(userMsg)).toBeInTheDocument();
        // Check if the loading message is displayed while waiting for the LLM's response
        expect(screen.getByText(i18n.t('llm-chat-loading-msg'))).toBeInTheDocument();

        waitFor(() => {
            // Check if the LLM's response is displayed after the loading message
            expect(screen.getByText(llmResponse)).toBeInTheDocument();
        });

    });

    it('should avoid sending multiple messages before receiving a response', async () => {
        renderComponent();

        // Simulates the axios post request to the LLM service
        mockAxios.onPost('http://localhost:8000/askllm/clue').reply(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([200, { answer: llmResponse }]);
                }, 2000);  // Simulates a delay of 2 seconds for the loading message to appear
            });
        });

        const userMsg = 'Hello LLM';
        const userMsg2 = 'Hello LLM again';
        const userMsg3 = 'Hello LLM pls answer me';
        await sendMessage(userMsg);
        await sendMessage(userMsg2);
        await sendMessage(userMsg3);

        // Check if the user's message is displayed
        expect(screen.getByText(userMsg)).toBeInTheDocument();
        // Check that the second message is not displayed because the user cannot send multiple messages before receiving a response
        await waitFor(() => {
            expect(screen.queryByText(userMsg2)).not.toBeInTheDocument();
        });
        // Check if the loading message is displayed while waiting for the LLM's response
        expect(screen.getByText(i18n.t('llm-chat-loading-msg'))).toBeInTheDocument();

        waitFor(() => {
            // Check if the LLM's response is displayed
            expect(screen.getByText(llmResponse)).toBeInTheDocument();
        });
    });

    it('should show an error message when the LLM service fails', async () => {
        renderComponent();

        mockAxios.onPost('http://localhost:8000/askllm/clue').reply(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([500]);  // Simulates a server error
                }, 2000); 
            });
        });

        const userMsg = 'Hello LLM';

        await sendMessage(userMsg);

        // Check if the user's message is displayed
        expect(screen.getByText(userMsg)).toBeInTheDocument();
        // Check if the loading message is displayed while waiting for the LLM's response
        expect(screen.getByText(i18n.t('llm-chat-loading-msg'))).toBeInTheDocument();

        waitFor(() => {
            // Check if the error message is displayed after the loading message
            expect(screen.getByText(i18n.t('llm-chat-error-msg'))).toBeInTheDocument();
        });
    });
})
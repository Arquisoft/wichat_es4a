import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

/**
 * Asks for a clue from the LLM service.
 *
 * @param {Object} params - The parameters for the request.
 * @param {string} params.name - The name of the user.
 * @param {string} params.userQuestion - The question asked by the user.
 * @param {string} params.language - The language of the question.
 * @returns {Promise<Object>} The response data from the LLM service.
 * @throws Will throw an error if the request fails.
 */
const askClue = async ({ correctAnswer, question, context, language }) => {
    try {
        const response = await axios.post(`${apiEndpoint}/askllm/clue`, {
            correctAnswer,
            question,
            context,
            language
        });
        return response;
    } catch (error) {
        console.error("Error en LLMService - askClue:", error);
        throw error;
    }
};

/**
 * Sends a welcome request to the LLM service.
 *
 * @param {Object} params - The parameters for the welcome request.
 * @param {string} params.name - The name of the user.
 * @param {string} params.language - The language preference of the user.
 * @returns {Promise<Object>} The response from the LLM service.
 * @throws Will throw an error if the request fails.
 */
const welcome = async ({ username, language }) => {
    try {
        const response = await axios.post(`${apiEndpoint}/askllm/welcome`, {
            username,
            language
        });
        return response;
    } catch (error) {
        console.error("Error en LLMService - welcome:", error);
        throw error;
    }
};

export { askClue, welcome };

import axios from 'axios';

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
    var cacheId;

    /**
     * Function to calll the API endpoint to get the next question
     * 
     * @returns {Promise<{question: {text: string, image: string, topic: string}, answers: {text: string, isCorrect: boolean}[]>}
     */
    const getNextQuestion = async () => {
        try {
            const response = await axios.post(apiEndpoint + '/api/game/question', {"cacheId" : cacheId});

            const fullStructure = {
                question: {
                    text: response.data.text,
                    imageUrl: response.data.imageUrl,
                    topic: ""
                },
                answers : [
                    {
                        text: response.data.answers[0].text,
                        isCorrect: response.data.answers[0].isCorrect
                    },
                    {
                        text: response.data.answers[1].text,
                        isCorrect: response.data.answers[1].isCorrect
                    },
                    {
                        text: response.data.answers[2].text,
                        isCorrect: response.data.answers[2].isCorrect
                    },
                    {
                        text: response.data.answers[3].text,
                        isCorrect: response.data.answers[3].isCorrect
                    }
                ]
            }
            return fullStructure;
        } catch (error) {
            console.error("Error al obtener la pregunta:", error);
        }
    };

    
    
    /**
    * @typedef {Object} Question
    * @property {String} text The question text
    * @property {String} [imageUrl] Image URL for the question
    * @property {String} selectedAnswer The answer selected by the user
    * @property {Object[]} answers Array of possible answers
    * @property {String} answers.text The answer text
    * @property {Boolean} answers.isCorrect Whether this answer is correct
    */

   /**
    * Sends the game data to the API endpoint to save it in the database.
    * 
    * @param {String} token Session token that stores the user ID.
    * @param {Question[]} gameQuestions Array of question objects.
    * @param {Number} numberOfQuestions The total number of questions in the game.
    * @param {Number} numberOfCorrectAnswers The number of correct answers.
    * @param {"normal" | "caos"} gameMode The game mode.
    * @param {Number} points The total points earned in the game.
    */
    const saveGame = async (token, gameQuestions, numberOfQuestions, numberOfCorrectAnswers, gameMode, points) => {
        try {
            const gameData = {
                "questions": gameQuestions,
                "numberOfQuestions": numberOfQuestions,
                "numberOfCorrectAnswers": numberOfCorrectAnswers,
                "gameMode": gameMode,
                "points": points
            };

            axios.post(apiEndpoint + '/api/game/endAndSaveGame', gameData,
                {   // Options (including headers)
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error("Error al guardar el juego:", error);
        }
    }

    /**
     * Sends the game configuration to the API endpoint to configure the type of questions to be asked.
     * 
     * @param {String[]} topics selected for the game
     * @param {"es" | "en"} lang language selected for the game questions
     */
    const configureGame = async (topics, lang) => {
        try {
            const gameConfig = {
                "topics": topics,
                "lang": lang
            };

            const response = await axios.post(apiEndpoint + '/api/game/new', gameConfig);
            cacheId = response.data.cacheId; // Store the cacheId for future requests
        } catch (error) {
            console.error("Error al guardar el juego:", error);
        }
    }


export { getNextQuestion, saveGame, configureGame };
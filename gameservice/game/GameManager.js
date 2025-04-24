
/**
 * Question and answer game management module.
 * 
 * This module handles the creation of new games, retrieving questions, 
 * validating answers, and storing a user's game history.
 * It uses in-memory cache to temporarily store game settings and 
 * connects to the database to store the game results and questions played.
 * 
 * Main functions:
 * - `newGame`: Creates a new game and stores the settings in cache.
 * - `next`: Retrieves the next question in the game without saving anything to the database.
 * - `endAndSaveGame`: Ends the game, saves the history and questions to the database.
 * - `getUserGames`: Retrieves all games associated with a user, including played questions.
 * - `getNumberOfQuestionsPlayed`: Retrieves the number of questions played in the current game.
 * - `getQuestion`: Retrieves the current question the user is on in the game.
 * - `getCurrentGame`: Retrieves the active game of a user.
 */

const { GamePlayed } = require("../models/game_played");
const { Question } = require("../models/Question");


const { requestQuestion} = require("./QuestionAsk");


const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const NodeCache = require("node-cache");
const gameCache = new NodeCache();


/**
 * Creates a new game for the user and stores the values in cache.
 * 
 * @param {Object} req - Request object containing game information.
 * @param {Object} res - Response object to send the response to the client.
 * @returns {void}  Sends an HTTP response based on the operation status.
 */
const newGame = async (req, res) => {
    try {
        let cacheId = req.body.cacheId;
        const { topics, lang } = req.body;
      

        const allowedTopics = ["geography", "history", "science", "sport", "character", "art", "entertainment"];
        const allowedLangs = ["es", "en"];

        if (
            !cacheId ||
            !topics ||
            (Array.isArray(topics) && topics.length === 0) ||
            (typeof topics === "string" && topics.trim() === "") ||
            !lang
        ) {
            return res.status(400).json({ error: "Missing or empty required fields: cacheId, topics, or lang." });
        }

         const topicList = Array.isArray(topics) ? topics : [topics];

         const invalidTopics = topicList.filter(t => !allowedTopics.includes(t));
        if (!allowedLangs.includes(lang) || invalidTopics.length > 0) {
            return res.status(400).json({ error: `Invalid topics or language` });
        }

        // Store values in cache
        gameCache.set(cacheId.toString(), { topics, lang });
        res.status(200).json({ cacheId });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Retrieves the next question in the current game without saving anything to the database.
 * 
 * @param {Object} req - Request object containing the user ID.
 * @param {Object} res - Response object to send the next question.
 * @returns {void}  Sends the current question of the game in JSON format.
 */
const next = async (req, res) => {

    try {
        let cacheId = req.body.user.userId;

        // Get values from cache
        const cacheData = gameCache.get(cacheId.toString());
        if (!cacheData || cacheId.trim() === "") return res.status(400).json({ error: "Game settings not found." });

        const { topics, lang } = cacheData;

        // Call requestQuestion without saving anything to the database
        const questionRaw = await requestQuestion(topics, lang);

        // Transform the response to the required format
        const formattedResponse = {
            text: questionRaw.question,  
            imageUrl: questionRaw.imageUrl || "", 
            selectedAnswer: questionRaw.selectedAnswer || "",  
            answers: questionRaw.options.map(option => ({
                text: option,
                isCorrect: option === questionRaw.answer  
            }))
        };



        res.status(200).json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Ends the game and saves the results to the database.
 * 
 * @param {Object} req - Request object containing the game history and user ID.
 * @param {Object} res - Response object to return a success or error status.
 * @returns {void}  Sends an HTTP response indicating success or failure of the operation.
 */
const endAndSaveGame = async (req, res) => {
    try {
       
        if (!req.body.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const game = req.body;

        // Validate input data
        if (!game.user.userId || !game || !game.questions || !Array.isArray(game.questions)) {
            return res.status(400).json({ error: "Missing fields or invalid format" });
        }

        const topicsSet = new Set();
        game.questions.forEach(q => {
            if (q.topics) {
                const topicList = Array.isArray(q.topics) ? q.topics : [q.topics];
                topicList.forEach(t => topicsSet.add(t));
            }
        });
        const uniqueTopics = Array.from(topicsSet);

        // Create a new game entry
        const newGame = new GamePlayed({
            userId: new mongoose.Types.ObjectId(game.user.userId),
            numberOfQuestions: game.numberOfQuestions,
            numberOfCorrectAnswers: game.numberOfCorrectAnswers,
            gameMode: game.gameMode,
            points: game.points,
            questions: game.questions,
            topics: uniqueTopics, 

        });


        // Save the game to the database
        const savedGame = await newGame.save();       


        // Save all the questions related to this game
        const questionsToInsert = game.questions.map(q => (
            {

            text: q.text, // Question text
            imageUrl: q.imageUrl, // Image URL
            selectedAnswer: q.selectedAnswer, // Selected answer by the user
            answers: q.answers.map(ans => ({
                text: ans.text, // Option text
                isCorrect: ans.isCorrect, // If it is the correct answer

            })),
          topics: q.topics 
            
        }));

        // Save all the questions to the database
        const savedQuestions = await Question.insertMany(questionsToInsert);

        // Update the played questions in the game
        savedGame.questionsPlayed = savedQuestions.map(question => question._id);
        await savedGame.save();


        res.status(200).json({ message: "Game data saved successfully." });
    } catch (error) {
        console.error(error.stack); // También podemos mostrar el stack del error para tener más contexto
    
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Retrieves all questions associated with a specific game.
 * 
 * @param {Object} req - Request object containing the game ID.
 * @param {Object} res - Response object to return the questions for the specified game.
 * @returns {void}  Sends the questions associated with the specified game in JSON format.
 */

const getGameQuestions = async (req, res) => {
    try {
        const gameId = req.body.gameId;  // Get the game ID from the URL parameters
        if (!gameId) {
            return res.status(400).json({ error: "Missing gameId in request body." });
        }
        

        // Find the game and populate the associated questions
        const game = await GamePlayed.findById(gameId)
            .populate('questionsPlayed')  // Populate the questions for this specific game

            .exec();

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        // Return the questions associated with the game in JSON format
        res.status(200).json(game.questionsPlayed);

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Retrieves all games associated with a user, excluding the associated questions.
 * 
 * @param {Object} req - Request object containing the user ID.
 * @param {Object} res - Response object to return the user's game history.
 * @returns {void}  Sends an array of games without associated questions in JSON format.
 */
const getUserGamesWithoutQuestions = async (req, res) => {
    try {
       
        const userId = req.body.user.userId ;  // Get the user ID from the request body
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized - missing userId." });
        }
        

        const objectId = new mongoose.Types.ObjectId(userId);
        const games = await GamePlayed.find({ userId: objectId }).exec();


        if (!games || games.length === 0) {
            return res.status(404).json({ "error": "No games found for this user." });
        }

        // Return games without associated questions in JSON format
        const formattedGames = games.map(game => ({
            _id: game._id,
            userId: game.user,  
            numberOfQuestions: game.numberOfQuestions,
            numberOfCorrectAnswers: game.numberOfCorrectAnswers || 0,  
            gameMode: game.gameMode,
            points: game.points,
            topics: game.topics || [] 

        }));
        res.status(200).json(formattedGames);   
         
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};


//MODIFICACIONES PARA QUE FUNCIONEN LOS POST
/**
 * Retrieves all questions associated with a specific game.
 * 
 * @param {Object} req - Request object containing the game ID as a URL parameter.
 * @param {Object} res - Response object to return the questions for the specified game.
 * @returns {void} Sends the questions associated with the specified game in JSON format.
 */
/*
const getGameQuestions = async (req, res) => {
    try {
        const gameId = req.params.gameId;  // Get the game ID from URL params
        if (!gameId) {
            return res.status(400).json({ error: "Missing gameId in URL parameters." });
        }

        const game = await GamePlayed.findById(gameId)
            .populate('questionsPlayed')
            .exec();

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        res.status(200).json(game.questionsPlayed);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};*/
/**
 * Retrieves all games associated with a user, excluding the associated questions.
 * 
 * @param {Object} req - Request object containing the user ID as a URL parameter.
 * @param {Object} res - Response object to return the user's game history.
 * @returns {void} Sends an array of games without associated questions in JSON format.
 */
/*
const getUserGamesWithoutQuestions = async (req, res) => {
    try {
        const userId = req.params.userId; // Get user ID from URL params
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized - missing userId." });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const games = await GamePlayed.find({ userId: objectId }).exec();

        if (!games || games.length === 0) {
            return res.status(404).json({ error: "No games found for this user." });
        }

        const formattedGames = games.map(game => ({
            _id: game._id,
            userId: game.user,
            numberOfQuestions: game.numberOfQuestions,
            numberOfCorrectAnswers: game.numberOfCorrectAnswers || 0,
            gameMode: game.gameMode,
            points: game.points,
            topics: game.topics || []
        }));

        res.status(200).json(formattedGames);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};*/

/**
 * Retrieves the number of questions played in the current game.
 * 
 * @param {Object} req - Request object containing the user ID.
 * @param {Object} res - Response object to return the number of questions played.
 * @returns {void}  Sends the number of questions played in the current game.
 */
const getNumberOfQuestionsPlayed = async (req, res) => {
    try {
        // Get the current game
        const game = await getCurrentGame(req, res);
        if (!game) return res.status(400).send("No active game found.");

        return game.questionsPlayed.length;
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Retrieves the current question for the user, i.e., the question the user is currently on.
 * 
 * @param {Object} req - Request object containing the user ID.
 * @param {Object} res - Response object to return the current question.
 * @returns {void}  Sends the current question along with options and answer in JSON format.
 */
const getQuestion = async (req, res) => {
    try {
        const userId = req.body.user.userId;


        // Get the active game first
        const currentGame = await getCurrentGame(req, res);
        if (!currentGame) {
            return res.status(400).send("No active game found for this user.");
        }

        // Get the ID of the last played question
        const lastQuestionId = currentGame.questionsPlayed[currentGame.questionsPlayed.length - 1];
        if (!lastQuestionId) {
            return res.status(400).send("No questions played yet.");
        }

        // Find the question with the corresponding ID
        const question = await Question.findOne({
            _id: lastQuestionId
        }).exec(); // Ensure it's a Mongoose document

        if (!question) {
            return res.status(400).send("No unanswered question found.");
        }

        return res.status(200).json({
            question: question.question,
            topics: question.topics,
            answer: question.answer,
            options: question.options,
            imageUrl: question.imageUrl || ""
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Retrieves the current active game of the user.
 * 
 * @param {Object} req - Request object containing the user ID.
 * @param {Object} res - Response object to return the current game.
 * @returns {Object}  Sends the active game of the user.
 */
const getCurrentGame = async (req, res) => {
    try {
        const userId = req.body.user.userId;

        // Find the game where isActive is true (active)
        const currentGame = await GamePlayed.findOne({ user: userId, isActive: true });

        if (!currentGame) {
            return res.status(400).send("No active game found for this user.");
        }

        return currentGame;
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    newGame,
    next,
    endAndSaveGame,
    getNumberOfQuestionsPlayed,
    getGameQuestions,
    getUserGamesWithoutQuestions};


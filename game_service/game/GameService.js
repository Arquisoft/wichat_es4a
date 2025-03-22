const { GamePlayed, Question, User } = require("../models");
const { validate, getCurrentQuestion } = require("./QuestionAsk");
const { loadQuestion } = require("./questionService");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { requestQuestion } = require("./QuestionAsk");

const privateKey = process.env.JWT_SECRET || "ChangeMePlease!!!!";

/**
 * Crea un nuevo juego para el usuario.
 */
const newGame = async (req, res) => {
    try {
        let userId = req.body.userId;
        if(userId === undefined || userId === null) {
            userId = new mongoose.Types.ObjectId();
        }
        const tags = req.body.tags ?? "";
        console.log("Creating new game for user:", userId);
       
        
        let settings = await User.create({  
            _id: userId,  // Asignar el userId proporcionado
            username: "prueba",
            friendCode:"1",
            password: "normal"
        });
        const idGame  = new mongoose.Types.ObjectId();
        console.log("Creating new game for game:", idGame);
        await GamePlayed.create({
            _id: idGame,
            user:userId,
            modality: "prueba",
            score: 0,
            topics: req.topics || "prueba",
            questionsPlayed: null,
            isActive: true
        });

        res.status(200).send();
    } catch (error) {
        console.error("Error creating a new game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Obtiene la siguiente pregunta en el juego actual.
 */
const next = async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log("Getting next question for user:", userId);
        const game = await getCurrentGame(req, res);

        if (!game) return;
        console.log("Game found:");
       
        let settings = await User.findOne({ _id: userId });
        console.log("Settings" + settings);
        if (!settings) {
            settings = await User.create({ user_id: userId });
        }

        const questionRaw = await requestQuestion();
        console.log("Question raw:" + questionRaw);
        let id = new mongoose.Types.ObjectId();
        console.log("Creating new question for game:", id);
        const question = await Question.create({
            _id:id,
            question: questionRaw.question,
            topics: questionRaw.topics,
            answer: questionRaw.answer,
            options: [questionRaw.answer, ...questionRaw.options],
            imageUrl: questionRaw.imageUrl || "",
            questionAnswered: false
           
        });
        game.questionsPlayed = game.questionsPlayed || []; // Asegurarse de que la lista de preguntas jugadas no sea nula
        console.log("Game questions played:" + question);
        game.questionsPlayed.push(question._id);  // Se agrega el ID de la pregunta al array de preguntas jugadas

        // Actualiza el juego con la nueva pregunta
        await game.save();


        res.status(200).json({
            question: questionRaw.question,
            topics: questionRaw.topics,
            answer: questionRaw.answer,
            options: [questionRaw.answer, ...questionRaw.options],
            imageUrl: questionRaw.imageUrl || ""
            
        });
    } catch (error) {
        console.error("Error getting next question:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Registra la respuesta de un usuario en una pregunta.
 */
const answer = async (req, res) => {
    try {
        const userId = req.body.userId;
        const gameId = req.body.gameId;
        const questionId = req.body.questionId;

        if (!validate(req, ['answer', 'gameId', 'questionId'])) {
            return res.status(400).send("Missing required fields.");
        }

        const answer = req.body.answer;
        const time = req.body.time;

        // Obtener el juego actual del usuario usando el gameId
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).send("Game not found.");
        }

        // Obtener la pregunta correspondiente usando questionId
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).send("Question not found.");
        }
        // Verifica que la pregunta no haya sido respondida ya
        if (question.questionAnswered ) {
            return res.status(400).send("This question has already been answered.");
        }

        // Registra la respuesta y calcula si fue dentro del tiempo
        question.useranswer = answer;
        question.questionAnswered = true;
        question.time = time;

        game.score =  game.score + 10;

   
    
  
        // Opcional: Puedes actualizar también el puntaje del juego aquí si es necesario
        
        await game.save();
        
        await question.save();  // Guarda la pregunta actualizada

        // Responde con la respuesta correcta (puedes personalizar esto si es necesario)
        res.status(200).json({
            correctAnswer: question.answer,
            userAnswer: question.user_answer,
            onTime: question.onTime
        });

        

    } catch (error) {
        console.error("Error submitting answer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Obtiene el número de preguntas jugadas en el juego actual.
 */
const getNumberOfQuestionsPlayed = async (req, res) => {
    try {
        // Obtiene el juego actual
        const game = await getCurrentGame(req, res);
        if (!game) return res.status(400).send("No active game found.");

    
        return game.questionsPlayed.length;
    } catch (error) {
        console.error("Error getting number of questions played:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Obtiene la pregunta actual del usuario, es decir la pregunta en la que está el usuario.
 */
const getQuestion = async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log("Getting current question for user:", userId);

        // Obtener el juego activo primero
        const currentGame = await getCurrentGame(req, res);
        if (!currentGame) {
            return res.status(400).send("No active game found for this user.");
        }

        // Obtener el ID de la última pregunta jugada
        const lastQuestionId = currentGame.questionsPlayed[currentGame.questionsPlayed.length - 1];
        if (!lastQuestionId) {
            return res.status(400).send("No questions played yet.");
        }

        // Buscar la pregunta con el ID correspondiente
        const question = await Question.findOne({ 
            _id: lastQuestionId
        }).exec(); // Asegúrate de que es un documento de Mongoose

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
        console.error("Error retrieving current question:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Obtiene el juego actual del usuario.
 */
const getCurrentGame = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        // Buscar el juego donde isActive es true (activo)
        const currentGame = await GamePlayed.findOne({ user: userId, isActive: true });

        if (!currentGame) {
            return res.status(400).send("No active game found for this user.");
        }

        return currentGame;
    } catch (error) {
        console.error("Error retrieving current game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Termina la partida actual del usuario y marca `isActive` como false.
 */
const endGame = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Obtén el juego actual del usuario
        const game = await getCurrentGame(req, res);

        if (!game || !game.isActive) {
            return res.status(400).send("No active game found or game already ended.");
        }

        // Marca el juego como no activo
        game.isActive = false;

        // Guarda los cambios
        await game.save();

        // Responde con un mensaje de éxito
        res.status(200).send("Game ended successfully.");
    } catch (error) {
        console.error("Error ending game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    newGame,
    next,
    answer,
    getNumberOfQuestionsPlayed,
    getQuestion,
    getCurrentGame,
    endGame
};

const axios = require('axios');
const { Game } = require("../models");

// Valida que el request tenga los campos requeridos en el cuerpo
const validate = (req, requiredFields) => {
    for (const field of requiredFields) {
        if (!(field in req.body)) {
            return false;
        }
    }
    return true;
};

// Obtiene la pregunta actual del usuario basado en su ID
const getCurrentQuestion = async (userId) => {
    let games = await Game.findAll({
        where: {
            user_id: userId
        }
    });

    // Si el usuario no tiene juegos activos, retorna null
    if (games == null || games.length < 1) {
        return null;
    }

    let game = games[0];  // Obtiene el primer juego encontrado

    let questions = await game.getQuestions();
    // Si no hay preguntas en el juego, retorna null
    if (questions == null || questions.length < 1) {
        return null;
    }

    return questions[0]; // Retorna la primera pregunta del juego
};

// Hace una solicitud para generar una nueva pregunta a un servicio externo
// Modificación en requestQuestion para usar una pregunta predeterminada si el servicio no responde
const requestQuestion = async (topics) => {
    let url = "http://question:8002/api/questions/generate";
    
    if (process.env.NODE_ENV !== "production") {
        url = "http://localhost:8002/api/questions/generate";
    }

    try {
        const res = await axios.post(url, { topics });

        const { question, correct, image, options } = res.data;

        if (!question || !correct || !image || !options || options.length < 1) {
            throw new Error("La pregunta no tiene el formato esperado.");
        }

        return {
            question,
            answer: correct,
            imageUrl: image,
            options,
            correct: options.includes(correct),
            topics // Añadir los topics para asegurarnos de que se están pasando correctamente
        };

    } catch (error) {
        console.error("Error al obtener la pregunta desde el servicio externo, usando pregunta simulada");

        return {
            question: '¿A qué país pertenece este contorno?',
            answer: 'Sri Lanka',
            imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Topography%20Sri%20Lanka.jpg',
            options: ['Catar', 'México', 'Kenia'],
            correct: true,
            topics: ["geography"]
        };
    }
};

module.exports = { validate, getCurrentQuestion, requestQuestion };

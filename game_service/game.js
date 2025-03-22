// External libs
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongodb = require('./db/mongo/Connection');

// Libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs");
const YAML = require('yaml');

// My own libs
const { newGame, next, answer, update, getGameSettingsByUser, getHistory, getHistoryByUser, setGameSettingsByUser, getNumberOfQuestions, getQuestion } = require("./game/GameService");
const { saveQuestionsInDB, deleteOlderQuestions, loadInitialQuestions } = require('./game/questionService');
const {requestQuestion} = require('./game/QuestionAsk');

const port = 8003;
const app = express();

// Prometheus configuration
const promBundle = require('express-prom-bundle');
const { getCurrentQuestion } = require("./game/QuestionAsk");
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Middleware 
app.use(bodyParser.json()); // Parse the request into JSON
app.use(cors()); // This API is listening on a different port from the frontend

// API endpoints
app.post('/api/game/new', (req, res) => {
  console.log('Iniciando un nuevo juego...');
  newGame(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/next', (req, res) => {
  console.log('Obteniendo la siguiente pregunta...');
  next(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/answer', (req, res) => {
  console.log('Respondiendo a la pregunta...');
  answer(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/update', (req, res) => {
  console.log('Actualizando el juego...');
  update(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/getHistory', (req, res) => {
  console.log('Obteniendo el historial...');
  getHistory(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/getHistoryByUser', (req, res) => {
  console.log('Obteniendo el historial por usuario...');
  getHistoryByUser(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/numberofquestions', (req, res) => {
  console.log('Obteniendo el número de preguntas...');
  getNumberOfQuestions(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/currentquestion', (req, res) => {
  console.log('Obteniendo la pregunta actual...');
  getQuestion(req, res); // Ejecutar la función cuando se haga la solicitud
});

// Leer el archivo OpenAPI YAML de forma síncrona
const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parsear el contenido YAML a un objeto JavaScript que represente el documento Swagger
  const swaggerDocument = YAML.parse(file);

  // Servir la documentación Swagger UI en el endpoint '/api-doc'
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("No se ha configurado OpenAPI. El archivo de configuración no está presente.");
}

// Conectar con MongoDB cuando se haga la primera solicitud (y no antes)
app.post('/api/connectMongo', (req, res) => {
  mongodb(); // Conexión a MongoDB solo cuando se hace esta solicitud
  res.status(200).send('Conexión a MongoDB establecida.');
});

/*
// Función para guardar las preguntas en la base de datos, solo cuando se llame explícitamente
app.post('/api/game/save-questions', async (req, res) => {
  console.log('Guardando preguntas...');
  await requestQuestion();
  //await saveQuestionsInDB(); // Solo se ejecuta cuando se hace la solicitud
  res.status(200).send('Preguntas guardadas');
});
*/
//soy ana y las imprimo por pantalla para verificar que esta funcionando bien la comunicacion entre microservicios
app.post('/api/game/save-questions', async (req, res) => {
  console.log('Guardando preguntas...');

  try {
    const { topics } = req.body; // Obtener los topics del request
    console.log('Topics recibidos:', topics);

    const questionData = await requestQuestion(topics); // Pasar los topics

    res.status(200).json({
      message: "Preguntas guardadas correctamente",
      question: questionData.question,
      correct: questionData.answer,
      imageUrl: questionData.imageUrl,
      options: questionData.options,
      correctAnswer: questionData.correct,
      topics: questionData.topics // Devolver los topics generados
    });
  } catch (error) {
    console.error("Error al guardar las preguntas", error);
    res.status(500).json({ message: "Hubo un error al guardar las preguntas" });
  }
});


// Función para eliminar preguntas antiguas, solo cuando se llame explícitamente
app.post('/api/game/delete-old-questions', async (req, res) => {
  console.log('Eliminando preguntas antiguas...');
  await deleteOlderQuestions(); // Solo se ejecuta cuando se hace la solicitud
  res.status(200).send('Preguntas antiguas eliminadas');
});

// Empezar el servidor
const server = app.listen(port, () => {
  console.log(`Game service listening at http://localhost:${port}`);
});

module.exports = server;
